# Introduction

This living document describes the moral code which guides every script included in the plugin. If you want to update this document please read [CONTRIBUTING](CONTRIBUTING.md) first.

Internet business models have become antagonistic toward site visitors. The prevailing monetization strategy is to get as many visitors as possible spending as long as possible on a site, to maximize their exposure to advertising channels.

Some netizens respond to this by installing Ad Blockers, which treat the symptom and not the cause. An Addiction Blocker works upstream by removing sites' addictive elements before they can even get their hooks into you.

# Code of Ethics

## I. Respect visitors' time

The guidelines in this section aim to reduce the commonly measured time-on-site metric. Time-on-site, when treated as a business objective, artificially elongates visits by promoting and re-enforcing addictive behavior.

### A. Each page on your site should have a single, clear objective. 

1. Leaf pages should not link to other leaf pages unless they are reference material for the current page. Instead, encourage visitors to return to a directory page where they can select a new topic.

   > ❌ Dark-pattern: An article on a news site contains a section at the bottom suggesting more articles for the visitor to read. The other articles are only related through metadata such as author, publish date, category, or keyword and are not reference material for the current article.

   > ❌ Dark-pattern: After watching a video on Youtube, similar videos are recommended based on metadata from the first video.

   > 👌 A Wikipedia entry about lightbulbs covers their invention, linking to Thomas Edison's entry.

### B. User-contributed commentary should focus on quality over quantity.

1. Prune comment threads fiercely to keep them on-topic.

   > ❌ Dark-pattern: The best rated reply of a Hacker News thread has 100 sub-replies, which are all shown before the second best rated reply.

   > 👌 The comments at the bottom of a Kotaku blog post are hidden by default until approved by a moderator.

1. When a comment is pruned, remove the entire branch.

    > ❌ Dark-pattern: A comment on a Reddit thread is deleted by a moderator but the replies to that comment remain. These replies no longer have any value without their parent and make it possible to get the gist of the deleted comment, which undermines the deletion.

## II. Respect visitors' agency

The guidelines in this section aim to reduce user behaviors that have been extrinsically motivated for the website's benefit, but not the user's.

### A. User profiles should not track vanity stats.

1. Karma counts should never be seen by visitors.

   > ❌ Dark-pattern: Karma count is displayed in the site header at the top of every Reddit page, reminding you that your every action is to be measured against other visitors
