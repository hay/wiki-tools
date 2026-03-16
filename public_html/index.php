<?php
    require '../lib/class-hay.php';

    $hay = new Hay("index");
    $hay->header();
?>
        <h1>Hay's tools</h1>

        <p>Hello. I'm <a href="http://www.haykranen.nl">Hay Kranen</a> and this is a list of some tools i've made.</p>

        <p>If you want to get in contact send me a <a href="mailto:hay@haykranen.nl">mail</a> or leave a message on my <a href="https://en.wikipedia.org/wiki/User_talk:Husky">Talk page</a>. Other ways of contacting me can be found on my <a href="https://www.haykranen.nl/me/">website</a>.

        <p>Note: on Wikipedia i'm also known as <a href="http://en.wikipedia.org/wiki/User:Husky">Husky</a>.</p>

        <h2>Tools</h2>

        <dl class="dl-horizontal">
        <?php
            $tools = $hay->getTools();

            foreach ($tools as $tool => $data) :
            ?>

                <?php if ($tool == "deprecated") : ?>
                    <hr>

                    <p class="text-warning">
                        The following tools are experimental and/or not maintained.
                        They might not work anymore.
                    </p>
                <?php endif; ?>

                <dt>
                    <?php if (isset($data->url)) : ?>
                    <a href="<?= $data->url; ?>">
                    <?php else: ?>
                    <a href="<?= $tool; ?>/">
                    <?php endif; ?>
                        <?php echo $data->title ?? ""; ?>
                    </a>
                </dt>
                <dd>
                    <?php echo $data->description ?? ""; ?>
                </dd>
            <?php
            endforeach;
            ?>
        </dl>

        <h2>Source</h2>

        <p>Code for all of these tools is on <a href="https://github.com/hay/wiki-tools">Github</a>. Please report any issues there.</p>
<?php
    $hay->footer();
?>