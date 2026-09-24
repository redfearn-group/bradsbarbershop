# Moving bradsbarbershop.com to GitHub Pages

## What this does

This moves hosting for bradsbarbershop.com from the paid WordPress.com plan to GitHub Pages, serving the Eleventy site built from `redfearn-group/bradsbarbershop`. Two things do not move and are not touched at any step:

- Domain registration stays at WordPress.com. WordPress.com remains the DNS host (nameservers ns1/ns2/ns3.wordpress.com). Only individual DNS records change.
- Email forwarding stays at WordPress.com. The MX record (`smtp-fwd.wordpress.com`) that forwards info@bradsbarbershop.com to you is part of the domain, not the hosting plan. Nothing in this guide removes it.

Steps 1 through 3 are read-only or additive: recording current state, merging the deploy workflow, and verifying domain ownership with GitHub. Nothing public changes until step 4, marked CHECKPOINT, where the live DNS record change happens. Do each step in order and confirm the expected result before moving to the next.

Two checkpoints in this guide need your explicit go-ahead before you act: step 4 (the DNS cutover) and step 8 (cancelling the WordPress.com plan). Do not run those without deciding you're ready.

---

## Step 1. Record the current DNS (read-only)

Nothing changes in this step. It records what's live today so you can put it back if you ever need to.

**1a. Look up the current records and save a copy.** Run this in PowerShell. It prints one table and saves the same table to your Desktop:

```powershell
$dns = foreach ($q in @(@('bradsbarbershop.com','A'), @('bradsbarbershop.com','AAAA'), @('www.bradsbarbershop.com','CNAME'), @('bradsbarbershop.com','NS'), @('bradsbarbershop.com','MX'), @('bradsbarbershop.com','TXT'))) { Resolve-DnsName -Name $q[0] -Type $q[1] -ErrorAction SilentlyContinue | Where-Object { $_.Section -eq 'Answer' } | Select-Object Name, Type, @{n='Value'; e={ if ($_.IPAddress) { $_.IPAddress } elseif ($_.NameHost) { $_.NameHost } elseif ($_.NameExchange) { $_.NameExchange } else { $_.Strings -join ' ' } }} }; $dns | Format-Table -AutoSize | Out-String -Width 200 | Out-File -Encoding utf8 "$env:USERPROFILE\Desktop\bradsbarbershop-dns-before.txt"; $dns | Format-Table -AutoSize
```

Expected: a seven-row table, and a file named `bradsbarbershop-dns-before.txt` on your Desktop with the same table:

```
Name                     Type Value
----                     ---- -----
bradsbarbershop.com         A 192.0.78.24
bradsbarbershop.com         A 192.0.78.25
www.bradsbarbershop.com CNAME bradsbarbershop.com
bradsbarbershop.com        NS ns1.wordpress.com
bradsbarbershop.com        NS ns2.wordpress.com
bradsbarbershop.com        NS ns3.wordpress.com
bradsbarbershop.com        MX smtp-fwd.wordpress.com
```

There are no AAAA or TXT rows, because neither record exists today. Paste the table into chat so there's a copy there too.

**1b. Screenshot the DNS records at WordPress.com.** Sign in at https://wordpress.com/domains/manage, click **bradsbarbershop.com**, then open **DNS records**. The older menu path is Upgrades > Domains > bradsbarbershop.com > DNS records. Take one screenshot that shows the whole list, including any rows marked "Handled by WordPress.com", and save it with the text file.

Expected: the list matches the table above. It shows two A records (or a single "Handled by WordPress.com" default), the www CNAME, and the MX record for email forwarding. This screenshot is your rollback reference.

**1c. Note the renewal date and price.** Open https://wordpress.com/me/purchases. Write down the renewal date and price for the **bradsbarbershop.com** domain, and separately for the **hosting plan**.

Expected: the domain and the plan are two separate lines, each with its own renewal date. Step 8 uses this to cancel only the plan.

Checkpoint: you have the text file, the screenshot and both renewal dates. Nothing on the live site has changed.

---

## Step 2. Merge the PR and confirm the build deploys

First, in the repo on GitHub, go to Settings > Pages > Build and deployment > Source and select "GitHub Actions." Do this before merging, because the deploy job fails if Pages isn't switched on yet.

Then merge the pull request that adds the site and `.github/workflows/deploy.yml`.

After merging, go to the Actions tab and confirm the workflow run finishes with a green check on "Build and deploy site."

To check the same thing from PowerShell instead of the browser:

```powershell
gh run list --repo redfearn-group/bradsbarbershop --limit 3
```

Expected: the most recent run shows status `completed` and conclusion `success`.

Until the custom domain is set, GitHub serves the site under the account's existing domain, at `https://redfearn.group/bradsbarbershop/`. It will look unstyled there, because the site expects to live at the root of its own domain. That is expected. Do not troubleshoot it. The real check happens in step 6.

Checkpoint: green check in Actions, and Settings > Pages shows Source as GitHub Actions.

---

## Step 3. Verify domain ownership with GitHub

The GitHub account `redfearn-group` is a personal user account, not an organization, so domain verification happens at the account level, not in the repo. Go to https://github.com/settings/pages, click "Verified domains," then "Add a domain," and enter `bradsbarbershop.com`.

GitHub will show you a TXT record to add: a host name like `_github-pages-challenge-redfearn-group` and a value it generates. Copy both exactly as GitHub displays them, don't retype them from memory.

Add that TXT record in WordPress.com DNS (Upgrades > Domains > bradsbarbershop.com > DNS records > Manage > Add a record). Wait a few minutes, then check it resolves before clicking Verify on GitHub:

```powershell
Resolve-DnsName _github-pages-challenge-redfearn-group.bradsbarbershop.com -Type TXT
```

Expected: a TXT record is returned whose value matches what GitHub showed you. If it returns nothing, wait a few more minutes and try again before you click Verify.

Once the command above shows the right value, go back to the GitHub page and click Verify.

Now attach the domain to the repo. In the repo, go to Settings > Pages > Custom domain, enter `bradsbarbershop.com`, and click Save. The site deploys with GitHub Actions, and in that mode GitHub ignores the `src/CNAME` file, so this field is what actually sets the domain. The DNS check under the field will fail until step 4. That's expected.

Checkpoint: GitHub shows bradsbarbershop.com as a verified domain on your account, and the repo's Custom domain field shows bradsbarbershop.com.

---

## Step 4. CHECKPOINT: cut DNS over to GitHub Pages

This is the live change. The site becomes reachable at the new host once this propagates, so don't start this step unless you're ready to see it through. Confirm with yourself, then proceed.

In WordPress.com DNS (Upgrades > Domains > bradsbarbershop.com > DNS records > Manage), add these records:

- A record, name `@`, points to `185.199.108.153`
- A record, name `@`, points to `185.199.109.153`
- A record, name `@`, points to `185.199.110.153`
- A record, name `@`, points to `185.199.111.153`
- AAAA record, name `@`, points to `2606:50c0:8000::153`
- AAAA record, name `@`, points to `2606:50c0:8001::153`
- AAAA record, name `@`, points to `2606:50c0:8002::153`
- AAAA record, name `@`, points to `2606:50c0:8003::153`
- CNAME record, name `www`, points to `redfearn-group.github.io`

WordPress.com's default A records show as "Handled by WordPress.com" and can't be edited directly. Adding your own custom A record for `@` replaces that default automatically, you do not need to delete it first. After you've added all four new A records, reopen the DNS list and confirm the old 192.0.78.24 and 192.0.78.25 entries are gone. Do the same for the old `www` CNAME: if one still points at `bradsbarbershop.com` after you add the new one pointing to `redfearn-group.github.io`, delete the leftover one so there's only a single `www` CNAME.

Leave the MX record (`smtp-fwd.wordpress.com`) exactly as it is. Do not touch it in this step or any other.

Verify with:

```powershell
Resolve-DnsName bradsbarbershop.com -Type A; Resolve-DnsName bradsbarbershop.com -Type AAAA; Resolve-DnsName www.bradsbarbershop.com -Type CNAME
```

Expected: A returns the four addresses 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 (order may vary). AAAA returns the four 2606:50c0:800x::153 addresses. CNAME for www returns redfearn-group.github.io.

DNS propagation can take up to 24 hours, though it's often much faster. If you still see the old WordPress.com addresses, wait and retry, or query a public resolver directly to bypass any local caching:

```powershell
Resolve-DnsName bradsbarbershop.com -Type A -Server 8.8.8.8
```

Checkpoint: both commands above show the new GitHub Pages addresses, not the old WordPress.com ones.

---

## Step 5. Confirm the custom domain in the repo

In the repo, go to Settings > Pages > Custom domain. Confirm it shows `bradsbarbershop.com` (you set it in step 3). Wait for the DNS check under that field to turn green. Once it does, tick "Enforce HTTPS." The certificate can take up to 24 hours to issue, if the checkbox isn't available yet, wait and check back.

Expected: DNS check is green, and "Enforce HTTPS" is either ticked or available to tick within 24 hours.

---

## Step 6. Confirm the site and email both work

Check DNS resolves to GitHub Pages:

```powershell
Resolve-DnsName bradsbarbershop.com -Type A
```

Expected: the four 185.199.x.153 addresses.

Check the site loads over HTTPS:

```powershell
(Invoke-WebRequest https://bradsbarbershop.com -UseBasicParsing).StatusCode
```

Expected: `200`.

Check www redirects to the apex domain:

```powershell
(Invoke-WebRequest https://www.bradsbarbershop.com -UseBasicParsing -MaximumRedirection 5).BaseResponse.ResponseUri.AbsoluteUri
```

Expected: `https://bradsbarbershop.com/`.

Finally, send a test email to info@bradsbarbershop.com from any account and confirm it arrives at your forwarding inbox. This isn't a PowerShell step, just send yourself a normal email. If it doesn't arrive, stop and check the MX record before doing anything else, the domain forwarding must not have been disturbed by step 4.

Checkpoint: status code 200, www resolves to the apex URL, and the test email arrives.

---

## Step 7. Check the Google Business Profile

The link itself doesn't change: it's still `https://bradsbarbershop.com`. Open the Google Business Profile and confirm the website link opens the new site.

If you want, this is also a good time to swap the profile photo to the new seal logo at `src/assets/seal.png` in the repo. That part is optional and not required for the move.

Checkpoint: none, this step has no DNS or hosting risk.

---

## Step 8. CHECKPOINT: cancel the WordPress.com hosting plan

Wait about 7 days after a stable launch before doing this step. Don't rush it, the rollback in the next section only works while the WordPress.com plan is still active.

Before cancelling anything, go to Upgrades > Purchases on WordPress.com and confirm the domain (bradsbarbershop.com) and the hosting plan are listed as two separate purchases with separate renewal lines. Cancel only the hosting plan. Leave the domain registration in place with auto-renew still on, and leave email forwarding in place, it's tied to the domain, not the plan, and should not need any action from you either way.

Expected: after cancelling, Upgrades > Purchases still shows bradsbarbershop.com as an active domain purchase with auto-renew on, and no hosting plan listed.

---

## Rollback

If something goes wrong after step 4 and before step 8, the WordPress.com site still works, it just isn't the one visitors reach until you reverse the DNS. To roll back:

1. In WordPress.com DNS, re-enter the records from your step 1 screenshot: A record for `@` pointing to 192.0.78.24, A record for `@` pointing to 192.0.78.25, and the CNAME for `www` pointing to `bradsbarbershop.com`.
2. Remove the eight GitHub A and AAAA records and the `www` CNAME to `redfearn-group.github.io` that you added in step 4.
3. Leave the MX record untouched, as always.

This only works because step 8 waits 7 days before cancelling the plan. Once the plan is cancelled, there's no WordPress.com site left to roll back to, which is the whole reason step 8 comes last.

---

## Editing the site later

Once the site is live on GitHub Pages, changes go through the normal Eleventy build and the GitHub Actions workflow, not through WordPress.com. See `README.md` in the repo root for the current build and edit instructions.
