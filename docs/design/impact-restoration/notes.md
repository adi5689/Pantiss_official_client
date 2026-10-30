# Our Impact layout restoration

The original section components are the visual references: CommunicationDevelopment (dashboard cards), ArticleSection1 (featured news and side cards), SocialImpact (report carousel), CapacityDevelopment (toolkit), PadcastsSection (video grid) and FactSheetsSection. Preserve their existing classes, sizes, colours and section order. Keep the original three interstitial banners and hero.

Only data wiring changes: read the Impact sheet once, group records by category, map the existing field names, and pass records into the original components. Do not restore static arrays or add the replacement library grid/search/filter layout. Empty sections safely omit their item renderer; loading, failure and empty-directory feedback are provided by the shared content state component. Existing admin, Google storage and published records are unchanged.

Article and resource actions use the shared dialog or validated destination links. Existing YouTube videos retain their original player. Resource and Coming soon states come from the Sheet.

Rendered verification: desktop screenshot confirms the original three-column dashboard presentation and red featured-news section. Mobile screenshot confirms the report coverflow carousel and original interstitial banner. Browser inspection found all six Sheet-backed report images and confirmed a report cover decoded successfully. The page renders at 390px width with the existing public-site zoom unchanged. Lint and the existing 19 tests pass.
