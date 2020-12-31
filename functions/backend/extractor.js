const URL = require('url').URL;
const Mercury = require('@postlight/mercury-parser');
const fetch = require('node-fetch');

const getBrowser = require('./browser')

function parseURL(url) {
    try {
        return new URL(url);
    }
    catch (error) {
        console.error(error)
        return '';
    }
}

async function getInfo(url) {

    url = encodeURI(url)

    var parsedURL = parseURL(url);

    if (!parsedURL || !parsedURL.protocol.startsWith('http')) {
        return { error: 'invalid_url' };
    }

    const response = await fetch(url, {
        method: 'HEAD'
    })

    var type = '';
    var title = '';
    var description = '';
    var hostname = parsedURL.hostname;
    var preview = '';

    const contentType = response.headers.get('content-type')

    if (contentType.startsWith("text")) {
        const parsed = await Mercury.parse(url, {
            contentType: 'text'
        })

        title = parsed.title || url
        description = parsed.excerpt || ""
        preview = parsed.lead_image_url || ""
        type = 'website'
    }
    else if (contentType.startsWith("image")) {
        title = url.substring(url.lastIndexOf('/') + 1)
        description = ""
        preview = url
        type = "image"
    }
    else {
        console.log(`ContentType ${contentType} cannot be parsed`);
        title = url;
        description = url;
        type = contentType
    }

    return {
        url,
        data: {
            title,
            description,
            preview,
            hostname,
            type
        }
    };

}

async function getScreenshot(url) {
    var parsedURL = parseURL(url);
    var page = null;
    if (!parsedURL || !parsedURL.protocol.startsWith('http')) {
        return { error: 'invalid_url' };
    }

    try {
        const browser = await getBrowser();

        page = await browser.newPage();
        await page.setCacheEnabled(false);
        await page.setViewport({
            width: 1024,
            height: 768
        });
        const response = await page.goto(url, {
            timeout: 25000,
            waitUntil: 'networkidle0'
        });

        if (response.ok()) {
            const contentType = (response.headers()['content-type'] || response.request().resourceType());

            if (contentType.startsWith('text/html')) {
                console.log('Getting screenshot of webpage');
                return {
                    contentType: 'image/png',
                    data: await page.screenshot({
                        fullPage: true,
                        encoding: 'binary'
                    })
                };
            }
            else if (contentType.startsWith('image')) {
                console.log('Content is already an image', contentType);
                return {
                    contentType,
                    data: await response.buffer()
                };
            }
            else {
                console.log(`Content type not supported: ${contentType}`);
                return { error: `Content type not supported: ${contentType}` };
            }
        }
        else {
            console.error(`Error occurred: ${response.status()}`);
            return {
                error: response.status()
            };
        }
    }
    catch (error) {
        console.error(error);
        return {
            error: 'An error occured'
        };
    }
    finally {
        console.log('Closing page');
        if (page) {
            page.close();
        }
    }
}


module.exports = {
    getInfo,
    getScreenshot
}