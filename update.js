let interval = 0
let display_window = undefined
let disply_doc = undefined
let default_search = true
const def_link = "https://www.bidbud.co.nz/browse/Computers?exclude_categories=-3842-4250-2924-0091-8729-0356-0358-0362-4570-0363-0364-0360-9844-0244-0043-0397&search_string=&category=0002-&user_region=100&sort_order=Default&condition=All&shipping_method=&suburbs=&min_price=&max_price=&display_type=normal&closing_type=";
let link = def_link;
let doc_set = false;
let ids = [];

// Bid Bud enforces a 100 request per hour limit
const delay = 37000;

window.onload = function ()
{
  display_window = document.getElementById("display_window");
  disply_doc = display_window.contentWindow ||
    display_window.contentDocument.document ||
    display_window.contentDocument;
  parseRequest();
  interval = setInterval(updateFeed, delay);
};

function fatalError()
{
  clearInterval(interval);
  interval = 0;
  alert("Unfortunately there was an error that could not be recovered from.\nPlease try refreshing the page or using a different browser");
  disply_doc.document.close();
}

function isValidLink( link )
{
  let prefix = "^(https?:\/\/)?www\.bidbud\.co\.nz\/(browse\/|search)";
  return link && link.search(prefix) === 0;
}

function getLink()
{
  let tmp_link = document.getElementById("link").value;

  // Check it is a valid Bid Bud Link
  if ( !isValidLink(tmp_link) ) {
    document.getElementById("link").value = "";
    alert("Invalid URL.\nUse www.bidbud.co.nz/browse/<Topic>?<Search Criteria>")
    return;
  }

  link = tmp_link;

  // Prefix with http if needed
  if(link.substr(0, 4) !== "http")
  {
    link = "http://" + link;
  }

  default_search = false;
  doc_set = false;
  ids = [];
  disply_doc.document.open();
  disply_doc.document.write("");
  disply_doc.document.close();
}

function makeFullPaths( data )
{
	const link_url = link.slice(0, link.search("\/(browse|search)"));
	data = data.replace(/href="\//g, "href=\"" + link_url + "\/");
	data = data.replace(/href="\?/g, "href=\"" + link_url + "\?");

	data = data.replace(/<a /g, "<a target=\"_blank\" ");
	return data;
}

function getResultsTableArray( data )
{
  start = data.search("<\/thead>") + 8;
  end = data.search("<\/table>");
  tbody = data.slice( start, end );
  entries = []

  next = tbody.search("<tr");
  while( next !== -1 )
  {
    tbody = tbody.slice( next );
    tbody = tbody.slice(tbody.search(">") + 1);
    end = tbody.search("<\/tr>");

    trow = tbody.slice( 0, end );
    next_col = trow.search("<td");
    cols = [];
    while( next_col !== -1 )
    {
      trow = trow.slice(next_col);
      trow = trow.slice( trow.search(">") + 1 );
      end_col = trow.search("<\/td>");

      cols.push( trow.slice( 0, end_col ) );
      next_col = trow.search("<td");
    }

    entries.push( cols );
    next = tbody.search("<tr");
  }
  return entries;
}

function updateDoc( data )
{
  table_data = getResultsTableArray( data );

  table = disply_doc.document.getElementById("search_results");

  rows = table.rows.length - 1;

  console.log(rows);
  console.log(table_data);

  for( i = Math.max(table_data.length, rows) - 1; i >= 0; i--)
  {
    if( i < rows )
    {
      table.deleteRow(i + 1);
    }
    if( i < table_data.length )
    {
      row = table.insertRow(i + 1);
      for( j = 0; j < table_data[i].length; j++)
      {
        var cell = row.insertCell(j);
        cell.innerHTML = table_data[i][j];
        console.log(cell.innerHtml);
      }
    }
  }
}

function parseData( data )
{
  if( data.search("excessive_searches") !== -1 )
  {
    alert("Search limit exceeded");
    fatalError();
	  return;
  }

  head = data.slice(0, data.search("</head>") + 7);

  data = data.slice(data.search("<table class=\"table\" id=\"search_results\">"));
  data = data.slice(0, data.search("</table>") + 8);

  if(!data)
  {
	  alert("Invalid URL.\nUse www.bidbud.co.nz/browse/<Topic>?<Search Criteria>");
	  fatalError();
  }

  data = makeFullPaths( data );
  if( !doc_set )
  {
    disply_doc.document.open();
    disply_doc.document.write(  makeFullPaths( head ) + "<body>\n" + data + "\n</body>");
    disply_doc.document.close();
    doc_set = true;
  }
  else {
    updateDoc( data );
  }
}

function displayBidBudData()
{
  $.get(
    link,
    parseData
  )
  .error( function() { alert( "Failed to get data. Check URL is correct and CORS extension is installed." ); fatalError(); });
}

function parseRequest( search = false )
{
  if(search)
  {
    getLink();
  }

  displayBidBudData();
}

function updateFeed()
{
  console.log("Update");
  parseRequest();
}

function launchFeed()
{
  if(interval !== 0)
  {
    clearInterval(interval);
  }
  parseRequest( true );
  interval = setInterval(updateFeed, delay);
}
