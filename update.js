let interval = 0
let display_window = undefined
let default_search = true
const def_link = "https://www.bidbud.co.nz/browse/Computers?exclude_categories=-3842-4250-2924-0091-8729-0356-0358-0362-4570-0363-0364-0360-9844-0244-0043-0397&search_string=&category=0002-&user_region=100&sort_order=Default&condition=All&shipping_method=&suburbs=&min_price=&max_price=&display_type=normal&closing_type=";
let link = def_link;
let body = undefined;
let ids = [];

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
  ids = [];
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

function removeElement( tmp_body, id )
{
  block_start = tmp_body.search("<tr class=\"is_featured\" id=\"" + id + "\">");
  block_end = tmp_body.slice(block_start).search("<\/tr>");
  return tmp_body.slice(0, block_start) + tmp_body.slice( block_end + 5 );
}

function removeOldEntries( data )
{
  tmp_body = body;

  for( i = ids.length - 1; i >= 0; i--)
  {
    id = ids[i];
    if( data.search("<tr class=\"is_featured\" id=\"" + id + "\">") === -1 )
    {
      tmp_body = removeElement( tmp_body, id );
      ids.splice( i, 1 );
    }
  }

  return tmp_body;
}

function updateChangedEntries( data, tmp_body )
{
  new_data = "";
  table_body = data.slice( data.search("<tbody>") + 7, data.search("<\/tbody>") );
  start = table_body.search("<tr class=\"is_featured\" id=\"[0-9][0-9]*\">");
  if( start === -1 )
  {
    alert("Unable to get search results");
    fatalError();
    return;
  }
  while( start !== -1 )
  {
    table_body = table_body.slice(start);
    // Get end of id string
    end = table_body.slice(28).search("\"");
    block_end = table_body.search("<\/tr>") + 5;
    if( end === -1 || block_end === -1 )
    {
      alert("Could not parse listing");
      fatalError();
      return;
    }
    id = table_body.substr(28, end);
    if( $.inArray( id, ids ) === -1 )
    {
      // Save data to insert
      ids.push( id );
      new_data += table_body.slice(0, block_end);
    }
    else {
      // Check for update
      tmp_body
    }

    table_body = table_body.slice( block_end );
    start = table_body.search("<tr class=\"is_featured\" id=\"[0-9][0-9]*\">");
  }

  return tmp_body;
}

function insertNewData( new_data, tmp_body )
{
    const insert_idx = tmp_body.search("<tbody>") + 7;
    if( insert_idx === -1 )
    {
      alert("Failed updating feed");
      fatalError();
      return;
    }
    new_data = tmp_body.slice(0, insert_idx) + new_data + tmp_body.slice(insert_idx);
    return new_data;
}

function updateDisplay( data )
{
  if( body !== undefined)
  {
    tmp_body = removeOldEntries( data );
    data = updateChangedEntries( data, tmp_body );
  }
  // Change relative paths of new
  return makeFullPaths( data );
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
  data = data.slice(0, data.search("</table>"));

  if(!data)
  {
	  alert("Invalid URL.\nUse www.bidbud.co.nz/browse/<Topic>?<Search Criteria>");
	  fatalError();
  }

  // Only update with new entries
  data = updateDisplay( data );
  body = data;

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
