let interval = 0
let display_window = undefined
let default_search = true
const def_link = "https://www.bidbud.co.nz/browse/Computers?exclude_categories=-3842-4250-2924-0091-8729-0356-0358-0362-4570-0363-0364-0360-9844-0244-0043-0397&search_string=&category=0002-&user_region=100&sort_order=Default&condition=All&shipping_method=&suburbs=&min_price=&max_price=&display_type=normal&closing_type=";
let link = def_link;

window.onload = function ()
{
  display_window = document.getElementById("display_window");
  parseRequest();
  interval = setInterval(updateFeed, 10000);
};

function fatalError()
{
  clearInterval(interval);
  alert("Unfortunately there was an error that could not be recovered from.\nPlease try refreshing the page or using a different browser");
}

function isValidLink( link )
{
  return true;
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
}

function parseData( data )
{
  
  display_window.src = "data:text/html;charset=utf-8," + escape(data);
}

function displayBidBudData()
{
  $.get(
    link,
    parseData
  )
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
  clearInterval(interval);
  parseRequest( true );
  interval = setInterval(updateFeed, 10000);
}
