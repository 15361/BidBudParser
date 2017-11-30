let interval = 0
let display_window = []
let disply_doc = []
const def_links = ["https://www.bidbud.co.nz/search?title=Latest+listings+in+Components&search_string=&user_region=100&category=0002-0359-&condition=Used&sort_order=ExpiryDesc&date_from=1509682255&exclude_categories=-0494-3947-0205-1353-0177-0827&saved=1&source=30933"];
//const filter_terms = ["term1", "term2", ..., "term last"]
let doc_set = [ false, false ];

// Bid Bud enforces a 100 request per hour limit
const delay = 74000;

window.onload = function ()
{
  display_window[0] = document.getElementById("display_window_left");
  disply_doc[0] = display_window[0].contentWindow ||
    display_window[0].contentDocument.document ||
    display_window[0].contentDocument
  parseRequest();
  interval = setInterval(updateFeed, delay);
};

function fatalError()
{
  clearInterval(interval);
  interval = 0;
  alert("Unfortunately there was an error that could not be recovered from.\nPlease try refreshing the page or using a different browser");
}

function makeFullPaths( data, idx )
{
	const link_url = def_links[idx].slice(0, def_links[idx].search("\/(browse|search)"));
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

function updateDoc( data, idx )
{
  table_data = getResultsTableArray( data );

  table = disply_doc[idx].document.getElementById("search_results");

  rows = table.rows.length - 1;

  for( i = Math.max(table_data.length, rows) - 1; i >= 0; i--)
  {
    if( i < rows )
    {
      table.deleteRow(i + 1);
    }
    if( i < table_data.length )
    {
      row = table.insertRow(i + 1);
      row.className = "is_featured";
      for( j = 0; j < table_data[i].length; j++)
      {
        var cell = row.insertCell(j);
        if( j === 1)
        {
          cell.className = "lvimg";
        }
        else if( j === 1 )
        {
          cell.className = "hidden-xs"
        }
        cell.innerHTML = table_data[i][j];
      }
    }
  }
}

function parseData( data, idx )
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

  data = makeFullPaths( data, idx );
  if( !doc_set[idx] )
  {
    disply_doc[idx].document.open();
    disply_doc[idx].document.write(  makeFullPaths( head, idx ) + "<body>\n" + data + "\n</body>");
    disply_doc[idx].document.close();
    doc_set[idx] = true;
  }
  else {
    updateDoc( data, idx );
  }
}

function displayBidBudData()
{
  for( i = 0; i < def_links.length; i++ )
  {
    const idx = i;
    function callback( data )
    {
      parseData( data, idx );
    }
    $.get(
      def_links[i],
      callback
    )
    .error( function() { alert( "Failed to get data. Check URL is correct and CORS extension is installed." ); fatalError(); });
  }
}

function parseRequest()
{
  displayBidBudData();
}

function updateFeed()
{
  console.log("Update");
  parseRequest();
}
