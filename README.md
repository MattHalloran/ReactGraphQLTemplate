
# ReactGraphQLTemplate
A fully-functioning template for building modern, maintainable websites.

![Project Preview](assets/private/readme-display.png)


## Website Features
- Modern design, with automatic dark mode
- Mobile-friendly
- Credentials and restricted pages
- Ability to send emails/texts
- Ability to upload images/files
- Search Engine Optimization (SEO) techniques


## Development stack
| Dependency  | Purpose  |  Version  |
|---|---|---|
| [ReactJS](https://reactjs.org/)  | UI  |  `^17.0.2` |
| [MaterialUI](https://material-ui.com/)  | UI Styling  |  `^5.0.0-beta.0`  |
| [Apollo](https://www.apollographql.com/)  | API (GraphQL) |  `^2.25.0` |
| [Prisma](https://www.prisma.io/)  | Easier GraphQL building |  `^2.30.2`  |
| [ExpressJs](https://expressjs.com/)  |  Backend Server  | `^4.17.1` |
| [PostgreSQL](https://www.postgresql.org/)  | Database  | `postgres:13` |
| [Redis](https://redis.io/) | Task Queueing | `redis` |


## [👩🏼‍💻 Developer setup][setup-guide]
Here is our [guide for setting up all Vrooli repos][setup-guide]. In addition to the common steps, you'll need to do the following:

### 1. Edit Business data
Edit the file `assets/public/business.json` to match your business's data.

### 2. Enter website information
This project is set up so an admin can update various aspects without needing to mess with servers/code. To log in as an admin, use the admin credentials set in the `.env` file.  
Once you are logged in, you should see a navigation option for "manage site". This includes links and descriptions to all of the admin functions. For inventory upload, there is an file that works with the example database, located in [assets/private](assets/private).

## Open Graph Tags
Open Graph is a metadata format that describes how your website should be shown when shared on social media. This data is set in the header, and can be edited at `packages/ui/public/index.html`. For more information, [here](https://developers.facebook.com/docs/sharing/webmasters/) is a guide from Facebook.

## Non-database storage
It is generally recommended to store data on an external server, but for smaller projects, local upload/download can also be useful. In this project, admins have a wide array of customization features, such as changing the images in a hero banner. Uploaded data is stored at `<project_dir>`/assets

## TypeScript generation debugging  
Sometimes, generating TypeScript will give a "JavaScript heap out of memory" error. This is difficult to debug, so it is important that you try to catch these early. Sometimes this is caused by packages using different TypeScript versions.

If that doesn't solve this issue, you can debug TypeScript by changing `yarn tsc` to `yarn tsc --generate trace-data`. This will create a folder called `trace-data`, which contains a log that you can upload to `about://tracing` on Edge or Chrome. See [TypeScript's performance tracing guide](https://github.com/microsoft/TypeScript/wiki/Performance#performance-tracing) for more information.

## Server debugging
When debugging the UI, we have a lot of options. There are console logs, Lighthouse testing, and [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi). The server, on the other hand, is a bit more complicated. 

The server also supports console logs, but they aren't available during production. Instead, we can look at logs. These are generated at `data/logs`. You can also track logs from a remote server, which is described in the *Remote debugging* section of this document.

For performance measuring, we can use the [0x profiling tool](https://github.com/davidmarkclements/0x) to generate flame graphs. Getting this to work with Docker is a little cumbersome, but the result is worth it. You have to:   
1. Change `nodemon` or `node` (depending on if you're calling the development or server script) to `0x --node`. Leave the arguments after the same.  
2. Start the project as normal. You should see a file named `isolate-<random_characters>.log`. This is not the flamegraph yet, but is used to generate it.  
3. Perform whatever test you need so that `0x` can gather data. 
4. To generate the flame graph, we have to stop the `0x` process manually. Start by entering the server container: `docker exec -it server sh`
5. Enter `ps` and look for a process with `node` and `0x` in the name. Make note of the PID (the number on the left)
6. Enter `kill -SIGINT <0x_PID>`. This will generate a folder called `<0x_PID.0x`.
7. Open the `.html` file in the generated folder to view the flame graph

## Email setup
It is often useful to send and receives emails with the website's address. Instructions to set that up can be found [here](/docs/MessengerSetup.txt)

## Theming
Picking the correct colors for your site can be easy or complicated, depending on how deeply you want to go into it (you could use color theory, for example). You also have to make sure that your theme's colors are different enough from each other to be distinguisable. I use [this color tool](https://material.io/resources/color/#!/?view.left=0&view.right=0) to create a solid starting point. The site's theme is set in [packages/ui/src/utils/theme.ts](packages/ui/src/utils/theme.ts).

By default, this site automatically sets dark or light theme depending on your browser's settings. This is accomplished in [packages/ui/src/App.ts](packages/ui/src/App.ts).

## Custom fonts
The easiest way to use custom fonts is by using [Google Fonts](https://fonts.google.com/). Once a font is selected, you should see some html needed for the font to be loaded. This can be pasted into [packages/ui/public/index.html](packages/ui/public/index.html). Then the font can be applied with the font-family CSS tag, as also shown on Google Fonts.

Alternatively, you can supply your own fonts. Using a site such as [1001 Fonts](https://www.1001fonts.com/) allows you to download a `.woff` or `.woff2` file for your desired font. This can be placed in [packages/ui/src/assets/fonts](packages/ui/src/assets/fonts), and registered in the global css section of [packages/ui/src/App.ts]() like so:  
```javascript
    import SakBunderan from './assets/fonts/SakBunderan.woff';
    ...
    "@global": {
        ...
        '@font-face': {
            fontFamily: 'SakBunderan',
            src: `local('SakBunderan'), url(${SakBunderan}) format('truetype')`,
            fontDisplay: 'swap',
        }
    },
```

Then, when you need to use the font, you can reference it like this:

```javascript
    navName: {
        ...
        fontSize: '3.5em',
        fontFamily: `SakBunderan`,
    },
```

When using a custom font, it is a good idea to compress it using [Font Squirrel](https://www.fontsquirrel.com/tools/webfont-generator). If you know which characters you need (such as for a logo), you can also delete unneeded characters via an app like [FontForge](https://fontforge.org/). In web development, size matters😉  

If you want to go even further (though it is probably not necessary), you can also encode your font as a base64 string so it can be used without fetching. On a Unix-based terminal, a `.woff` can be converted to base64 using the command `base64 -w 0 yourfont.woff > yourfont-64.txt`. Then, you can enter that string into the `@font-face` src like so: 

```javascript
    ...
    '@font-face': {
        ...
        src: `local('SakBunderan'), url(data:font/woff;charset=utf-8;base64,insertyourbase64stringhere) format('truetype')`,
        ...
    }
```

## GraphQL
[GraphQL](https://graphql.org/) is a query language for APIs. It is a faster, understandable, and modernan alternative to REST APIs.

### GraphQL debugging
GraphQL syntax errors are notoriously hard to debug, as they often do not give a location. Luckily, this project is structured in a way that allows these issues to be tracked down. 

In the [schema directory](packages/service/src/schema), the GraphQL resolvers are split up into individual files, which are stitched together in the [index file](packages/service/src/schema/index.ts). In this file, the `models` object is used to combine all of the individual schemas. If you make this an empty array, you can comment out imports until the problem goes away. This allows you to pinpoint which schema file is causing the error. Common errors are empty parentheses (ex: `users():` instead of `users:`) and empty brackets.

### GraphQL TypeScript generation
GraphQL is already typed, but it unfortunately doesn't play well with TypeScript's typing system. Instead of creating TypeScript types yourself (which is tedious), they can be generated automatically from an endpoint. This requires the backend server to be running.  

See [this video](https://youtu.be/Tw_wn6XUfnU) for more details.

#### Server TypeScript generation
1. Start project locally **in development mode** (if ui is not runnable, that's fine. We just need a working server) - `docker-compose up -d`
2. `cd packages/server`
3. `yarn graphql-generate`

#### UI TypeScript generation
1. Start project locally **in development mode** (if ui is not runnable, that's fine. We just need a working server) - `docker-compose up -d`
2. `cd packages/ui` 
3. `yarn graphql-generate`  

## Local testing on another device
Mobile devices can be simulated in Chrome Dev Tools, so testing is usually only done on your main development computer. However, if you'd still like to test on a different device, it will unfortunately not work out-the-box. This is because development uses the `localhost` alias. Your device will not be able to resolve this to the correct IP address (ex: `192.168.0.2`), so you have to change it manually. There are 2 places where this must be done: (1) [packages/server/src/index.ts](https://github.com/MattHalloran/ReactGraphQLTemplate/blob/master/packages/server/src/index.ts); and (2) [packages/shared/src/apiConsts.ts](https://github.com/MattHalloran/ReactGraphQLTemplate/blob/master/packages/shared/src/apiConsts.ts).


## Testing performance, accessibility, and SEO
[Lighthouse](https://developers.google.com/web/tools/lighthouse) is an open-source tool for testing any website's (even localhost) performance, accessibility, and Search Engine Optimization (SEO). This can be accessed in Chrome Dev Tools. The tool generates a report in less than a minute, which gives plenty of details and resources that you can look through. This website template is designed to maximize Lighthouse performance by default, but your specific needs may vary. Some places to look at are:  
- Compress static images - The easiest way to reduce request payloads is by compressing static images. This can be done on many sites, such as [this one for PNGs](https://compresspng.com/) and [this one](https://jakearchibald.github.io/svgomg/) for SVGs.
- [Sitemap.ts](packages/ui/src/Sitemap.ts) and [Routes.ts](packages/ui/src/Routes.ts) - Automatically generates a sitemap for your website. This helps web crawlers determine which pages are important, and what the pages contain. See [this article](https://developers.google.com/search/docs/advanced/sitemaps/overview) for more information
- Remove unused dependencies - The easiest way I've found to discover unused dependencies is with [depcheck](https://www.npmjs.com/package/depcheck):    
    1. In project's root directory, enter `yarn global add depcheck`  
    2. `depcheck` or `npx depcheck`  
    3. Repeat in each package (packages/server, packages/shared, packages/ui)  
Before removing packages, please make sure that depcheck was correct. If you are only using the package in a Dockerfile, for example, it may not catch it!
- Remove unused components and pages - Every byte counts with web responsiveness! One method for finding unused code is to use [ts-unused-exports](https://github.com/pzavolinsky/ts-unused-exports).
- Peek inside code bundles - Seeing what's inside the code bundles can help you determine what areas of the code should be lazy loaded, and what is taking the most space. To do this:  
    1. `cd packages/ui ` 
    2. `yarn build`
    3. `yarn analyze`
**Note**: If `yarn analyze` is not working, then the source-map-explorer is likely unable to open your web browser. In this case, try running it directly with the `--html` flag (i.e. `npx source-map-explorer --html source-tree.html <bundles_location>`) (vite example [must have sourcemap set to `true`]: `npx source-map-explorer --html source-tree.html dist/assets/*`). Then open the generated file directly

**NOTE**: When testing for performance, make sure you are running a production build. This can be set with `NODE_ENV` in the .env file. If you would like to test performance locally, make sure the `SERVER_LOCATION` variable is set to 'local'. Just be mindful that certain performance features (such as cache policy) may be handled by Nginx, so they won't be available locally.


## Brave Rewards
Brave Rewards is a service that allows users of the Brave browser to earn Basic Attention Tokens (BAT) for viewing ads. Enabling this on your website will also allow you to earn BAT. The ads appear as a small popup in the bottom right corner of the browser. To set this up:  
1. Sign up your website (and your socials if you'd like) [here](https://publishers.basicattentiontoken.org/).
2. On your website's server (see *Deploying Project* section to set this up), cd to `packages/ui/build` in your project's directory.
3. `vim .well-known/brave-rewards-verification.txt`
4. Paste the text given in step 1 into the file, and save.

## Ads
I hate ads as much as anyone else, but they're still an important monetization tool. The easiest way to set up ads is through [Google AdSense](https://www.google.com/adsense). If you'd like to specify where the ads appear, you should follow [these instructions](https://support.google.com/adsense/answer/9274025) to set up an "ad unit".

Some tips for implementing ads:  
1. Make sure the font matches your site's font (`Lato` in this repo).
2. Make sure that pages and dialogs leave enough padding at the bottom so that nothing is cut off by a banner ad  
3. Make sure to change `data-ad-client` and related fields from this repo's ad components (if I've implemented them yet), so you receive the ad revenue instead of me.

## Deploying project
Currently, the cheapest way to deploy a web project seems to be through VPS hosting. [Here](https://www.digitalocean.com/community/tutorials/how-to-set-up-an-ubuntu-20-04-server-on-a-digitalocean-droplet) is an example of how to do this on DigitalOcean. Instead of a plain Ubuntu server, however, it is easier to install one that already contains Docker.


### 1. Set up DNS
The site can be accessed by the VPS's IP address, but in most cases you'll want to associate the server with a domain name. There are many places to buy domains, but I use [Google Domains](https://domains.google)

Once you buy a domain, you must set up the correct DNS records. This can be done through the site that you bought the domain from, or the site that you bought the VPS from. [Here](https://www.youtube.com/watch?v=wYDDYahCg60) is a good example. **Note**: DNS changes may take several hours to take effect

### 2. Set up VPS - Reverse proxy
The VPS you'll be running this website on must be configured to handle website traffic. This is done through Nginx https://olex.biz/2019/09/hosting-with-docker-nginx-reverse-proxy-letsencrypt/

I've created [a project that automates this process](https://github.com/MattHalloran/NginxSSLReverseProxy#getting-started).

### 3. Set up VPS - Main code
1. `cd ~`
2. `git clone ${PROJECT_URL}`
3. `cd ${PROJECT_NAME}`
4. Edit .env variables
5. **Make sure that the urls in `packages/ui/public/index.html` point to the correct website**
6. `chmod +x ./scripts/*`
7. `docker-compose up -d`


## Contributions
Contributions are always welcome! If you have suggestions for improvements, please create an issue or a pull request💖

[setup-guide]: https://docs.vrooli.com/setup/getting_started.html
