# Background

Provides a scrum poker like board for folks to estimate projects based on 3 categories (risk, complexity and effort) instead of just a fibonacci number alone. Also, because the scrum estimation board we currently use is sketchy and takes forever to load I wanted one of my own that's open source.

# DEMO 
# ACCESSING THE DEMO READ ME FIRST! PASSWORD!
Note: Password! To protect my site from whatever/robots you need to add ?password=lilpassword! on the end of the below:
Test site: https://estimations-test-board.netlify.app

![Estimation Board](screenshot-1.png)

In the project directory, you can run:

# Setup

## Install Dependencies (one time)
cd estimation && npm install
cd estimation/web-server && npm install

## Frontend:
export REACT_APP_BACKEND_URL=http://localhost:5000/
Note: REACT_APP_BACKEND_URL=<netlify_backend_url, see step below> 
cd estimation && npm start 
Example: export REACT_APP_BACKEND_URL=http://127.0.0.1:9000/ && npm start 

## Backend: (in another window)
export REDIS_URL="redis://<username>:<password>@url:port"
cd webserver & node index.js

Runs the app in the development mode.\
Open [http://localhost:3000?password=<SEE ABOVE>](http://localhost:3000?password=<SEE ABOVE>) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### Troubleshooting
If you get `opensslErrorStack` errors; you can get around this for now by using `export NODE_OPTIONS=--openssl-legacy-provider` before the npm commands

```opensslErrorStack: [ 'error:03000086:digital envelope routines::initialization error' ],
  library: 'digital envelope routines',
  reason: 'unsupported',
  code: 'ERR_OSSL_EVP_UNSUPPORTED'
```

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).