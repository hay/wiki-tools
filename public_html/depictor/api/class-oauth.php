<?php
    use MediaWiki\OAuthClient\Client;
    use MediaWiki\OAuthClient\ClientConfig;
    use MediaWiki\OAuthClient\Consumer;
    use MediaWiki\OAuthClient\Token;

    // Based on https://github.com/wikimedia/mediawiki-oauthclient-php/tree/master/demo

    class OAuth {
        private ClientConfig $config;
        private Client $client;
        private Consumer $consumer;
        private string $authUrl;
        public string $userState;

        function __construct(array $opts) {
            session_start();
            $this->setupClient($opts);
            $this->userState = $this->getUserState();

            // Check if we have a oauth_verifier, and if so get an
            // access token and set it
            if ($this->userState == "access-token-request") {
                $this->getAccessToken();
            }
        }

        public function getAuthUrl():string {
            [$authUrl, $token] = $this->client->initiate();
            $this->authUrl = $authUrl;

            $_SESSION["request_key"] = $token->key;
            $_SESSION["request_secret"] = $token->secret;
            return $this->authUrl;
        }

        public function logout():void {
            session_start();
            session_destroy();
        }

        private function getAccessToken() {
            $requestToken = new Token(
                $_SESSION["request_key"], $_SESSION["request_secret"]
            );

            $accessToken = $this->client->complete(
                $requestToken, $_GET["oauth_verifier"]
            );

            $_SESSION['access_key'] = $accessToken->key;
            $_SESSION['access_secret'] = $accessToken->secret;

            // No longer need the request tokens
            unset( $_SESSION['request_key'], $_SESSION['request_secret'] );
        }

        private function getUserState():string {
            // Little helper function for tidier code
            $has = function(string $key):bool {
                return $_SESSION[$key] ?? false;
            };

            if ($has("access_key") && $has("access_secret")) {
                return "logged-in";
            }

            if ($has("request_key") && $has("request_secret")) {
                // We can only do a proper request if we also have a verifier
                if ($_GET["oauth_verifier"] ?? false) {
                    return "access-token-request";
                } else {
                    return "invalid-access-token-request";
                }
            }

            // All other states are assumed to be 'logged out'
            return "logged-out";
        }

        private function setupClient(array $opts) {
            $this->config = new ClientConfig($opts["endpoint"]);
            $this->consumer = new Consumer(
                $opts["consumer_key"], $opts["consumer_secret"]
            );
            $this->config->setConsumer($this->consumer);
            $this->client = new Client($this->config);
        }
    }