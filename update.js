let interval = 0
let display_window = undefined
let default_search = true
const def_link = "https://www.bidbud.co.nz/browse/Computers?exclude_categories=-3842-4250-2924-0091-8729-0356-0358-0362-4570-0363-0364-0360-9844-0244-0043-0397&search_string=&category=0002-&user_region=100&sort_order=Default&condition=All&shipping_method=&suburbs=&min_price=&max_price=&display_type=normal&closing_type=";
let link = def_link;
let body = undefined;

const delay = 37000

window.onload = function ()
{
  display_window = document.getElementById("display_window");
  parseRequest();
  interval = setInterval(updateFeed, delay);
};

function fatalError()
{
  clearInterval(interval);
  interval = 0;
  alert("Unfortunately there was an error that could not be recovered from.\nPlease try refreshing the page or using a different browser");
}

function isValidLink( link )
{
  let prefix = "^(https?:\/\/)?www\.bidbud\.co\.nz\/browse\/";
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
  body = undefined;
  display_window.src = undefined;
}

function makeFullPaths( data )
{
	const link_url = link.slice(0, link.search("\/browse"));
	data = data.replace(/href="\//g, "href=\"" + link_url + "\/");
	data = data.replace(/href="\?/g, "href=\"" + link_url + "\?");

	data = data.replace(/<a /g, "<a target=\"_blank\"");
	return data;
}

function findNewEntries( data )
{
	return data;
}

function parseData( data )
{
  if( data.search("excessive_searches") !== -1 )
  {
    alert("Search limit exceeded");
    fatalError();
	return;
  }

  head = data.slice(0, data.search("</head>"));

  data = data.slice(data.search("<table class=\"table\" id=\"search_results\">"));
  data = data.slice(0, data.search("</table>"));

  if(!data)
  {
	  alert("Invalid URL.\nUse www.bidbud.co.nz/browse/<Topic>?<Search Criteria>");
	  fatalError();
  }

  // Only update with new entries
  data = findNewEntries( data );
  // Change relative paths
  data = makeFullPaths( data );

  display_window.src = "data:text/html;charset=utf-8," + escape(head + "<body>\n" + data + "\n</body>");
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
