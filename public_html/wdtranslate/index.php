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
    </style>

    <h1><?php $hay->title(); ?></h1>

    <p class="lead"><?php $hay->description(); ?></p>

    <div class="row" ng-controller="MainCtrl">
        <div class="col-md-6">
            <form>
                <button class="btn btn-info"
                        ng-click="selectLanguage()"
                >Translate from {{inputlanguage.label}}</button>

                <br /><br />

                <input type="text"
                       class="form-control"
                       ng-model="input"
                       placeholder="Enter your term here..."
                       typeahead="term.label for term in suggest($viewValue)"
                       typeahead-min-length="3"
                       typeahead-on-select="search($item)"
                />
            </form>
        </div>

        <div class="col-md-6">
            <ul>
                <li ng-repeat="label in labels">
                    {{label.language | language}} : <strong>{{label.value}}</strong>
                </li>
            </ul>
        </div>
    </div>

    <script type="text/ng-template" id="languageModal.html">
        <div class="modal-header">
            <h3 class="modal-title">Choose a language</h3>
        </div>

        <div class="modal-body">
            <ul>
                <li ng-repeat="language in languages">
                    <a class="btn btn-link" ng-click="setLanguage(language)">{{language.label}}</a>
                </li>
            </ul>
        </div>
    </script>

    <script>
        window.LANGUAGES = <?php echo file_get_contents('./languages.json'); ?>;
    </script>

    <script src="../common/angular.js"></script>
    <script src="../common/angular-ui-bootstrap.js"></script>
    <script src="app.js"></script>
<?php
    $hay->footer();
?>