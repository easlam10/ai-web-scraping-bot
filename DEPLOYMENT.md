# University Scraping Bot - Heroku Deployment Guide

## Heroku Deployment Instructions

This application uses Puppeteer to scrape web content. Follow these steps to deploy it on Heroku.

### Prerequisites

- Heroku CLI installed
- Git installed
- Node.js installed

### Deployment Steps

1. **Login to Heroku**

```bash
heroku login
```

2. **Create a new Heroku app (if you don't have one already)**

```bash
heroku create your-app-name
```

3. **Add the required buildpacks**

The app uses the Puppeteer Heroku buildpack which is already configured in the `.buildpacks` file and `app.json`.

If you need to add it manually:

```bash
heroku buildpacks:add https://github.com/jontewks/puppeteer-heroku-buildpack
```

4. **Set environment variables**

```bash
heroku config:set NODE_ENV=production
```

Add any other environment variables required by your application.

5. **Deploy to Heroku**

```bash
git add .
git commit -m "Ready for Heroku deployment"
git push heroku main
```

### Important Notes

- The application is configured to use Puppeteer with the `--no-sandbox` flag for Heroku compatibility.
- If you need to render Chinese, Japanese, or Korean characters, you may need to use a different buildpack with additional font files: https://github.com/CoffeeAndCode/puppeteer-heroku-buildpack