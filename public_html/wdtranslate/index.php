<?php
    require '../../lib/class-hay.php';

    $hay = new Hay("wdtranslate");
    $hay->header();
?>
    <style>
        .modal-body ul {
            -webkit-column-count: 5;
            padding: 0;
            list-style: none;
        }

        h1 {
            margin-top: -5px;
        }

        form {
            margin-bottom: 10px;
        }

        .input-group-addon-transparent {
            background: none;
            border: none;
        }

        .text-strong {
            font-weight: bold;
        }

        .loading.ng-hide {
            visibility: hidden;
            display: block !important;
        }

        .loading {
            margin-top: -20px;
            text-align: center;
            background: #eee;
        }
    </style>

<div ng-controller="MainCtrl">

    <h1><?php $hay->title(); ?></h1>

    <p class="lead"><?php $hay->description(); ?></p>

    <p>
        Your current preferred languages are:

        <span ng-repeat="language in preferredLanguages">
            <span ng-class="{'text-strong' : inputLanguage == language.code}">{{language.label}}</span>

            <span ng-if="$index < preferredLanguages.length - 2">,</span>
            <span ng-if="$index == preferredLanguages.length - 2"> and </span>
        </span>.<br />

        <a href="" ng-click="selectPreferredLanguages()">
            Change your preferred languages?
        </a>
    </p>

    <hr />

    <div class="row">
        <div class="loading" ng-show="loading">
            Loading...
        </div>

        <div class="col-md-6">
            <form>
                <div class="input-group">
                    <div class="input-group-addon input-group-addon-transparent">Translate from:</div>

                    <select class="form-control"
                            ng-model="inputLanguage"
                            ng-options="lang.code as lang.label for lang in preferredLanguages"
                    ></select>
                </div>
            </form>

            <form>
                <input type="text"
                       class="form-control"
                       ng-model="input.label"
                       placeholder="Enter your term here..."
                       typeahead="term for term in suggest($viewValue)"
                       typeahead-min-length="3"
                       typeahead-on-select="search($item)"
                       typeahead-template-url="typeahead.html"
                       typeahead-input-formatter="currentTerm.label"
                />
            </form>
        </div>

        <div class="col-md-6">
            <ul>
                <li ng-repeat="label in labels">
                    {{label.language | language}} :
                     <strong>
                        <a href="http://{{label.language}}.wikipedia.org/wiki/{{label.value}}">
                        {{label.value}}
                        </a>
                    </strong>

                    <div ng-if="label.description">
                        <span class="text-muted">{{label.description}}</span>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</div>

    <script type="text/ng-template" id="languageModal.html">
        <div class="modal-header">
            <h3 class="modal-title">Choose a language</h3>
        </div>

        <div class="modal-body">
            <ul>
                <li ng-repeat="language in languages">
                    <a class="btn"
                       ng-class="{ 'btn-info' : language.preferred, 'btn-link' : !language.preferred}"
                       ng-click="language.preferred = !language.preferred"
                    >{{language.label}}</a>
                </li>
            </ul>
        </div>

        <div class="modal-footer">
            <button class="btn btn-primary" ng-click="ok()">OK</button>
        </div>
    </script>

    <script type="text/ng-template" id="typeahead.html">
        <a>
            <span bind-html-unsafe="match.label.label | typeaheadHighlight:query"></span><br />
            <span bind-html-unsafe="match.label.description" class="text-muted"></span>
        </a>
    </script>

    <script>
        window.LANGUAGES = <?php echo file_get_contents('./languages.json'); ?>;
    </script>

    <script src="//tools-static.wmflabs.org/cdnjs/ajax/libs/angular.js/1.2.16/angular.min.js"></script>
    <script src="//tools-static.wmflabs.org/cdnjs/ajax/libs/angular-ui-bootstrap/0.11.0/ui-bootstrap-tpls.js"></script>
    <script src="app.js"></script>
<?php
    $hay->footer();
?>