<?php
    require '../../lib/vendor/autoload.php';
    require '../../lib/class-hay.php';

    $hay = new Hay("directory");
    $hay->header();
?>

<style>
    #wrapper {
        max-width: inherit;
    }

    #header h1 {
        margin-top: 0;
    }

    #header button {
        margin-top: 20px;
    }

    #search {
        text-align: center;
        margin-bottom: 20px;
    }

    @media (min-width: 640px) {
        #search input {
            width: 500px;
        }
    }

    span[tooltip] {
        text-decoration: underline;
        cursor: pointer;
    }

    .tooltip {
        text-align: left;
    }
</style>

<div ng-controller="MainCtrl">
    <div id="header" class="row">
        <div class="col-md-6">
            <h1><?php $hay->title(); ?></h1>
        </div>

        <div class="col-md-6">
            <button ng-click="addTool()" class="btn btn-primary pull-right">Add your tool</button>
        </div>
    </div>

    <p class="lead">
        <?php $hay->description(); ?>
        <span ng-show="!filter">
            Search through <strong>{{tools.length}}</strong> tools here.</p>
        </span>

    <div id="app">
        <h3 ng-show="loading">Loading...</h3>

        <form id="search" class="form-inline clearfix" ng-show="!filter">
            <div class="form-group">
                <label for="search">I need...</label>
                <input class="form-control" type="text" name="search" ng-keyup="search()" ng-model="searchValue" />
            </div>
        </form>

        <div class="alert alert-info" ng-show="filter">
            Only showing <span ng-show="tools.length == 1">one tool</span> <span ng-show="tools.length > 1">{{tools.length}} tools</span> with <strong>{{value}}</strong> as <strong>{{filter}}</strong>.
            <a href="#" ng-click="resetFilter()">Show all tools instead?</a>
        </div>

        <div class="alert alert-danger" ng-show="noSearchResults">
            No search results for this query...
        </div>

        <ul class="tools">
            <li ng-repeat="tool in tools" class="tools-item col-md-4">
                <h3>
                    <a href="{{tool.url}}" ng-click="trackClick(tool.name, tool.url)">{{tool.title || tool.name}}</a>
                </h3>

                <h4>{{tool.description}}</h4>

                <h5 ng-if="tool.author || tool.repository">
                    <span ng-if="tool.author">
                        By
                        <span ng-repeat="author in tool.author">
                            <a href="#/author/{{author}}">{{author}}</a><span ng-if="tool.author.length > 1 && !$last">,</span>
                        </span>
                    </span>

                    <span ng-if="tool.repository">
                        (<a href="{{tool.repository}}">source available</a>)
                    </span>
                </h5>

                <p class="tools-keywords" ng-if="tool.keywords">
                    <a href="#/keyword/{{keyword}}" ng-repeat="keyword in tool.keywords">
                    {{keyword}}
                    </a>
                </p>
            </li>
        </ul>
    </div>

    <hr />

    <h2 id="addtool">Add your tool to the directory</h2>

    <p class="lead">Note that your tool <strong>does not</strong> have to be hosted on WMF Labs. If you have a tool living on your own server, a Javascript gadget on a wiki, or a non-web tool such as a bot feel free to add it using the methods mentioned below.</p>

    <h3>Step 1</h3>

    <p>Add a <code>toolinfo.json</code> file to your tool. Your JSON file should look something like this. <strong>Hover over the properties to see a description.</strong></p>

    <pre><code>{
    <span tooltip="A unique name for your tool" tooltip-placement="right">"name"</span> : "hay-tools-directory",
    <span tooltip="A descriptive title" tooltip-placement="right">"title"</span> : "Tools Directory",
    <span tooltip="A short summary of what your tool does" tooltip-placement="right">"description"</span> : "Discover Wikimedia-related tools.",
    <span tooltip="URL to your tool. Should be unique. If it's not a web tool, link to the documentation." tooltip-placement="right">"url"</span> : "http://tools.wmflabs.org/hay/directory",
    <span tooltip="Separate keywords by comma" tooltip-placement="right">"keywords"</span> : "tools, search, discoverability",
    <span tooltip="For multiple authors, separate by comma" tooltip-placement="right">"author"</span> : "Hay Kranen",
    <span tooltip="Link to the code repository" tooltip-placement="right">"repository"</span> : "https://github.com/hay/wiki-tools.git"
}</code></pre>

    <p>The <code>name</code>, <code>title</code>, <code>description</code> and <code>url</code> properties are <strong>required</strong>. Both <code>name</code> and <code>url</code> <strong>need</strong> to be unique.</p>

    <p>If you have multiple tools you can also declare multiple tools in one <code>toolinfo.json</code>, simply use an array with objects.</p>

    <pre><code>
[
    {
        "name" : "hay-directory",
        ....
    },
    {
        "name" : "hay-exturl",
        ....
    }
]
    </code></pre>

    <h3>Step 2</h3>

    <p>Make sure your toolinfo.json file is reachable over regular HTTP, for example:</p>

    <p><code><a href="http://tools.wmflabs.org/hay/directory/toolinfo.json">http://tools.wmflabs.org/hay/directory/toolinfo.json</a></code></p>

    <h3>Step 3</h3>

    <p>Add the link to your toolinfo.json file to the <a href="https://wikitech.wikimedia.org/wiki/User:Hay/directory">Wiki directory page</a>.
    The location of this page will probably change in the future (it's now in my user namespace). Simply put in on a newline. You can also add comments with a hash (<code>#</code>) to group your <code>toolinfo.json</code> files.</p>

    <h4>Step 4</h4>

    <p>Wait :). The crawler parses all toolinfo.json files every 60 minutes and saves them to a local database. If after a few hours your tool doesn't appear on this page maybe there was an error somewhere. Check the <a href="crawler.log">crawler logs</a> (latest crawls are at the bottom).</p>

    <h4>Step 5</h4>

    <p>There is no step 5. Enjoy! If you have any bugs or questions please submit them to the <a href="https://github.com/hay/wiki-tools">Github repo</a>.</p>
</div>

    <script src="../common/angular.js"></script>
    <script src="../common/angular-ui-bootstrap.js"></script>
    <script src="app.js"></script>
<?php
    $hay->footer();
?>