$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$config = Get-Content (Join-Path $root 'src/data/pubmed-config.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$base = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Get-Remote($url) {
  for ($attempt = 0; $attempt -lt 3; $attempt++) {
    try { return (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 45).Content }
    catch { if ($attempt -eq 2) { throw }; Start-Sleep -Seconds (2 + $attempt) }
  }
}
function Text($node, $xpath) {
  $found = $node.SelectSingleNode($xpath)
  if ($null -eq $found) { return '' }
  return ($found.InnerText -replace '\s+', ' ').Trim()
}

try {
  $term = [Uri]::EscapeDataString($config.query)
  $search = Get-Remote "${base}esearch.fcgi?db=pubmed&term=$term&retmode=json&retmax=10000&sort=pub_date&tool=lucid_lab" | ConvertFrom-Json
  if ($search.error -or $search.esearchresult.ERROR) { throw 'PubMed search returned an error.' }
  $ids = @($search.esearchresult.idlist)
  if ($ids.Count -eq 0 -or $ids.Count -ne [int]$search.esearchresult.count) {
    throw 'Search returned no records or an incomplete result. Existing publications were kept.'
  }
  $records = @()
  $received = @()
  for ($offset = 0; $offset -lt $ids.Count; $offset += 100) {
    Start-Sleep -Milliseconds 400
    $last = [Math]::Min($offset + 99, $ids.Count - 1)
    $batch = $ids[$offset..$last] -join ','
    $raw = Get-Remote "${base}efetch.fcgi?db=pubmed&id=$batch&retmode=xml&tool=lucid_lab"
    # Disable external XML resolution; only parse the returned document.
    $xml = New-Object System.Xml.XmlDocument
    $xml.XmlResolver = $null
    $xml.LoadXml($raw)
    if ($xml.SelectSingleNode('//ERROR')) { throw 'PubMed fetch returned an error.' }
    foreach ($record in $xml.SelectNodes('/PubmedArticleSet/PubmedArticle')) {
      $pmid = Text $record 'MedlineCitation/PMID'
      $received += $pmid
      if ($config.excludePmids -contains $pmid) { continue }
      $article = $record.SelectSingleNode('MedlineCitation/Article')
      $date = $article.SelectSingleNode('Journal/JournalIssue/PubDate')
      $year = Text $date 'Year'
      $month = Text $date 'Month'
      $day = Text $date 'Day'
      $dateLabel = (@($year, $month, $day) | Where-Object { $_ }) -join ' '
      if (!$year) {
        $dateLabel = Text $date 'MedlineDate'
        if ($dateLabel -match '\d{4}') { $year = $Matches[0] }
      }
      if (!$year) { throw "Missing publication year for PMID $pmid" }
      $monthNumber = 1
      if ($month -match '^\d+$') { $monthNumber = [int]$month }
      elseif ($month.Length -ge 3) {
        $names = @('Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec')
        $index = [Array]::IndexOf($names, $month.Substring(0,3))
        if ($index -ge 0) { $monthNumber = $index + 1 }
      }
      $dayNumber = 1
      if ($day -match '^\d+$') { $dayNumber = [int]$day }
      $authors = @($article.SelectNodes('AuthorList/Author') | ForEach-Object {
        $collective = Text $_ 'CollectiveName'
        if ($collective) { $collective }
        else { (@((Text $_ 'LastName'), (Text $_ 'ForeName'), (Text $_ 'Suffix')) | Where-Object { $_ }) -join ' ' }
      })
      $abstract = @($article.SelectNodes('Abstract/AbstractText') | ForEach-Object {
        [ordered]@{ label = $_.GetAttribute('Label'); text = ($_.InnerText -replace '\s+', ' ').Trim() }
      })
      $keywords = @($record.SelectNodes('MedlineCitation/KeywordList/Keyword') | ForEach-Object { $_.InnerText } | Select-Object -Unique)
      $doi = Text $record 'PubmedData/ArticleIdList/ArticleId[@IdType="doi"]'
      if (!$doi) { $doi = Text $article 'ELocationID[@EIdType="doi"]' }
      $title = Text $article 'ArticleTitle'
      if (!$pmid -or !$title) { throw 'Incomplete PubMed record; existing data was kept.' }
      $records += [ordered]@{
        pmid = $pmid; title = $title; year = [int]$year
        sortDate = ('{0}-{1:00}-{2:00}' -f $year, $monthNumber, $dayNumber)
        date = $dateLabel; authors = $authors
        journal = Text $article 'Journal/Title'
        volume = Text $article 'Journal/JournalIssue/Volume'
        issue = Text $article 'Journal/JournalIssue/Issue'
        pages = Text $article 'Pagination/StartPage | Pagination/MedlinePgn'
        doi = $doi; abstract = $abstract; keywords = $keywords
        type = Text $article 'PublicationTypeList/PublicationType'
      }
    }
    Write-Host "Fetched $($received.Count) / $($ids.Count) records"
  }
  if (@($received | Select-Object -Unique).Count -ne $ids.Count -or @($ids | Where-Object { $_ -notin $received }).Count) {
    throw 'Incomplete fetch; existing data was kept.'
  }
  $data = [ordered]@{
    query = $config.query; updatedAt = (Get-Date).ToString('yyyy-MM-dd')
    searchCount = $ids.Count
    articles = @($records | Sort-Object -Property @{Expression={ $_.sortDate }; Descending=$true}, @{Expression={ [int]$_.pmid }; Descending=$true})
  }
  $target = Join-Path $root 'src/data/publications.json'
  $json = ConvertTo-Json -InputObject $data -Depth 15
  [IO.File]::WriteAllText("$target.tmp", $json, (New-Object Text.UTF8Encoding $false))
  Move-Item -LiteralPath "$target.tmp" -Destination $target -Force
  Write-Host "Saved $($records.Count) publications."
} catch {
  Write-Error $_
  exit 1
}
