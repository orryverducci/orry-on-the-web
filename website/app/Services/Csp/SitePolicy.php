<?php

namespace App\Services\Csp;

use Spatie\Csp\Directive;
use Spatie\Csp\Keyword;
use Spatie\Csp\Policies\Policy;

class SitePolicy extends Policy
{
    public function configure()
    {
        $this
            ->addDirective(Directive::DEFAULT, Keyword::SELF)
            ->addDirective(Directive::STYLE, Keyword::SELF)
            ->addDirective(Directive::STYLE, 'sha256-rql2tlBWA4Hb3HHbUfw797urk+ifBd6EAovoOUGt0oI=')
            ->addDirective(Directive::SCRIPT, Keyword::SELF)
            ->addDirective(Directive::SCRIPT, Keyword::UNSAFE_EVAL)
            ->addDirective(Directive::SCRIPT, 'static.cloudflareinsights.com')
            ->addDirective(Directive::CONNECT, Keyword::SELF)
            ->addDirective(Directive::CONNECT, 'cloudflareinsights.com')
            ->addDirective(Directive::CHILD, Keyword::NONE)
            ->addDirective(Directive::FRAME_ANCESTORS, Keyword::NONE)
            ->addNonceForDirective(Directive::SCRIPT);
    }
}
