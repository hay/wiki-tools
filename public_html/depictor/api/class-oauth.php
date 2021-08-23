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
        private string $endpoint;
        private string $oauthEndpoint;
        private string $apiEndpoint;
        private Token $accessToken;
        private bool $mockLogin = false; // Used for debugging purposes
        public string $userState;

        const STATE_LOGGED_IN = "logged-in";
        const STATE_ACCES_TOKEN_REQUEST = "access-token-request";
        const STATE_INVALID_ACCESS_TOKEN_REQUEST = "invalid-access-token-request";
        const STATE_LOGGED_OUT = "logged-out";

        function __construct(array $opts) {
            session_start();
            $this->mockLogin = $opts["mockLogin"] ?? false;
            $this->endpoint = $opts["endpoint"];
            $this->oauthEndpoint = $this->endpoint . "/w/index.php?title=Special:OAuth";
            $this->apiEndpoint = $this->endpoint . "/w/api.php";
            $this->setupClient($opts);
            $this->userState = $this->getUserState();

            // Check if we have a oauth_verifier, and if so get an
            // access token and set it
            if ($this->userState == self::STATE_ACCES_TOKEN_REQUEST) {
                $this->getAccessToken();
            } else if ($this->userState == self::STATE_LOGGED_IN && !$this->mockLogin) {
                // Set the accesstoken for easy use later on
                $this->accessToken = new Token(
                    $_SESSION["access_key"], $_SESSION["access_secret"]
                );
            }
        }

        public function fakeLogin() {
            // Useful for debug purposes
            $this->userState = self::STATE_LOGGED_IN;
        }

        public function getAuthUrl():string {
            [$authUrl, $token] = $this->client->initiate();
            $this->authUrl = $authUrl;

            $_SESSION["request_key"] = $token->key;
            $_SESSION["request_secret"] = $token->secret;
            return $this->authUrl;
        }

        public function getIdentity() {
            $this->assertLogin();
            return $this->client->identify($this->accessToken);
        }

        public function logout():void {
            session_destroy();
        }

        public function requestCsrfToken():string {
            $this->assertLogin();
            $req = $this->requestGet("action=query&meta=tokens&format=json");
            $data = json_decode($req);

            return $data->query->tokens->csrftoken;
        }

        public function requestGet(string $query) {
            $this->assertLogin();
            $url = $this->apiEndpoint . "?$query";
            return $this->client->makeOAuthCall($this->accessToken, $url);
        }

        public function requestPost(array $query) {
            $this->assertLogin();
            return $this->client->makeOAuthCall(
                $this->accessToken,
                $this->apiEndpoint,
                true,
                $query
            );
        }

        private function assertLogin() {
            if ($this->mockLogin) {
                throw new Exception("mockLogin is set to true");
            }

            if ($this->userState != self::STATE_LOGGED_IN) {
                throw new Exception("Can't do unauthenticated action");
            }
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
            if ($this->mockLogin) {
                return self::STATE_LOGGED_IN;
            }

            // Little helper function for tidier code
            $has = function(string $key):bool {
                return $_SESSION[$key] ?? false;
            };

            if ($has("access_key") && $has("access_secret")) {
                return self::STATE_LOGGED_IN;
            }

            if ($has("request_key") && $has("request_secret")) {
                // We can only do a proper request if we also have a verifier
                if ($_GET["oauth_verifier"] ?? false) {
                    return self::STATE_ACCES_TOKEN_REQUEST;
                } else {
                    return self::STATE_INVALID_ACCESS_TOKEN_REQUEST;
                }
            }

            // All other states are assumed to be 'logged out'
            return self::STATE_LOGGED_OUT;
        }

        private function setupClient(array $opts) {
            $this->config = new ClientConfig($this->oauthEndpoint);
            $this->consumer = new Consumer(
                $opts["consumer_key"], $opts["consumer_secret"]
            );
            $this->config->setConsumer($this->consumer);
            $this->client = new Client($this->config);
        }
    }