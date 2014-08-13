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

    #search input {
        width: 500px;
    }
</style>

<div ng-controller="MainCtrl">
    <div id="header" class="row">
        <div class="col-md-6">
            <h1><?php $hay->title(); ?></h1>
        </div>

        <div class="col-md-6">
            <button ng-click="addTool()" class="btn btn-primary pull-right">Add your tool</a>
        </div>
    </div>

    <p class="lead"><?php $hay->description(); ?></p>

    <div id="app">
        <h3 ng-show="loading">Loading...</h3>

        <form id="search" class="form-inline clearfix" ng-show="!filter">
            <div class="form-group">
                <label for="search">I need...</label>
                <input class="form-control" type="text" name="search" ng-keyup="search()" ng-model="searchValue" />
            </div>
        </form>

        <div class="alert alert-info" ng-show="filter">
            Only showing all tools with <strong>{{value}}</strong> as <strong>{{filter}}</strong>.
            <a href="#" ng-click="resetFilter()">Show all tools instead?</a>
        </div>

        <div class="alert alert-danger" ng-show="noSearchResults">
            No search results for this query...
        </div>

        <ul class="tools">
            <li ng-repeat="tool in tools" class="tools-item col-md-4">
                <h3><a href="{{tool.url}}">{{tool.name}}</a></h3>
                <h4>{{tool.description}}</h4>
                <h5>By <a href="#/author/{{tool.author}}">{{tool.author}}</a></h5>

                <p class="tools-keywords">
                    <a href="#/keyword/{{keyword}}" ng-repeat="keyword in tool.keywords">
                    {{keyword}}
                    </a>
                </p>
            </li>
        </ul>
    </div>

    <hr />

    <h2 id="addtool">Add your tool to the directory</h2>

    <h3>Step 1</h3>

    <p>Add a <code>toolinfo.json</code> file to your tool. Your JSON file should look something like this:</p>

    <pre><code>
{
    "name" : "Tools Directory",
    "description" : "A way to easily discover Wikimedia-related tools.",
    "url" : "http://tools.wmflabs.org/hay/directory",
    "keywords" : "tools, search, discoverability",
    "author" : "Hay Kranen"
}
    </code></pre>

    <p>All the fields are <strong>required</strong>.</p>

    <h3>Step 2</h3>

    <p>Make sure your toolinfo.json file is reachable over regular HTTP, for example:</p>

    <p><code><a href="http://tools.wmflabs.org/hay/directory/toolinfo.json">http://tools.wmflabs.org/hay/directory/toolinfo.json</a></code></p>

    <h3>Step 3</h3>

    <p>Add the link to your toolinfo.json file to the <a href="https://wikitech.wikimedia.org/wiki/User:Hay/directory">Wiki directory page</a>.
    The location of this page will probably change in the future (it's now in my user namespace). This should be in the format <code>toolname: url to tool</code>, e.g:</p>

    <pre><code>
directory: http://tools.wmflabs.org/hay/directory/toolinfo.json
    </code></pre>

    <p>The <code>toolname</code> is used for logging, it has no other purpose right now.</p>

    <h4>Step 4</h4>

    <p>Wait :). The crawler parses all toolinfo.json files every 60 minutes and saves them to a local database. If after a few hours your tool doesn't appear on this page maybe there was an error somewhere. Check the <a href="crawler.log">crawler logs</a> (latest crawls are at the bottom).</p>

    <h4>Step 5</h4>

    <p>There is no step 5. Enjoy! If you have any bugs or questions please submit them to the <a href="https://github.com/hay/wiki-tools">Github repo</a>.</p>
</div>

    <script src="../common/angular.js"></script>
    <script src="app.js"></script>
<?php
    $hay->footer();
?>