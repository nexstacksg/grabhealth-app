TITLE: Define Content Type Attributes in Strapi Schema
DESCRIPTION: This JSON snippet illustrates the definition of attributes within a Strapi content type schema. It demonstrates how to specify attribute types such as `string`, `text`, and `uid`, and apply validation rules like `minLength`, `maxLength`, `unique`, `default`, and `required` for fields like 'title', 'description', and 'slug'.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/static/llms-full.txt#_snippet_169

LANGUAGE: json
CODE:

```
{
  "attributes": {
    "title": {
      "type": "string",
      "minLength": 3,
      "maxLength": 99,
      "unique": true
    },
    "description": {
      "default": "My description",
      "type": "text",
      "required": true
    },
    "slug": {
      "type": "uid",
      "targetField": "title"
    }
  }
}
```

---

TITLE: Configuring Strapi Content-Type Model Settings (JSON)
DESCRIPTION: This JSON snippet demonstrates how to configure basic settings for a Strapi content-type model within its `schema.json` file. It specifies the `kind` as 'collectionType', indicating it manages multiple entries, and sets the `collectionName` to 'Restaurants_v1', which defines the database table name where the content will be stored. This configuration is crucial for defining how the content-type behaves and where its data resides in the database.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/backend-customization/models.md#_snippet_0

LANGUAGE: JSON
CODE:

```
// ./src/api/[api-name]/content-types/restaurant/schema.json

{
  "kind": "collectionType",
  "collectionName": "Restaurants_v1"
}
```

---

TITLE: Strapi Client Collection Type Usage Examples
DESCRIPTION: These examples demonstrate how to use the `client.collection()` method to perform common operations on collection types, such as fetching all articles, retrieving a specific article, creating a new entry, updating an existing one, and deleting a document.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/static/llms-full.txt#_snippet_23

LANGUAGE: js
CODE:

```
const articles = client.collection('articles');

// Fetch all english articles sorted by title
const allArticles = await articles.find({
  locale: 'en',
  sort: 'title',
});

// Fetch a single article
const singleArticle = await articles.findOne('article-document-id');

// Create a new article
const newArticle = await articles.create({ title: 'New Article', content: '...' });

// Update an existing article
const updatedArticle = await articles.update('article-document-id', { title: 'Updated Title' });

// Delete an article
await articles.delete('article-id');
```

---

TITLE: Starting Strapi in Development Mode - Shell
DESCRIPTION: The `strapi develop` command starts a Strapi application with auto-reloading enabled, adding a file watcher to restart the application on file changes and middlewares for Hot Module Replacement (HMR) in the administration panel. It supports various options like `--open` to launch the browser, `--no-watch-admin` to prevent admin panel code auto-reload, and deprecated options like `--no-build` and `--watch-admin`. This command is not suitable for production environments.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/cli.md#_snippet_0

LANGUAGE: shell
CODE:

```
strapi develop
options: [--no-build |--no-watch-admin |--browser |--debug |--silent]
```

---

TITLE: Installing Strapi with SQLite using NPM
DESCRIPTION: This command utilizes NPM's `npx` to create a new Strapi project named 'my-project', pre-configured with SQLite as the default database. The `--quickstart` option simplifies the installation, automatically opening the application in the browser after setup.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/configurations/database.md#_snippet_15

LANGUAGE: Bash
CODE:

```
npx create-strapi-app@latest my-project --quickstart
```

---

TITLE: Starting Strapi Server in Production (NPM)
DESCRIPTION: This Bash command starts the Strapi server in a production environment using npm. By setting `NODE_ENV` to `production`, the server operates with production-specific configurations, including performance optimizations and security enhancements, making it suitable for live deployment.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/deployment.md#_snippet_8

LANGUAGE: Bash
CODE:

```
NODE_ENV=production npm run start
```

---

TITLE: Defining Environment Variables in .env File
DESCRIPTION: This snippet demonstrates how to define a simple environment variable, DATABASE_PASSWORD, within a .env file. Variables defined here are used to store sensitive or environment-specific configurations, preventing them from being hardcoded directly into application files.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/configurations/guides/access-cast-environment-variables.md#_snippet_0

LANGUAGE: sh
CODE:

```
DATABASE_PASSWORD=acme
```

---

TITLE: Configuring Strapi Content-Type Lifecycle Hooks in JavaScript
DESCRIPTION: This JavaScript snippet demonstrates how to define declarative lifecycle hooks for a Strapi content type by creating a `lifecycles.js` file. It includes `beforeCreate` to modify data before creation (e.g., applying a discount) and `afterCreate` to process the result after creation. This method automatically applies to the specified content type.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/backend-customization/models.md#_snippet_19

LANGUAGE: JavaScript
CODE:

```
module.exports = {
  beforeCreate(event) {
    const { data, where, select, populate } = event.params;

    // let's do a 20% discount everytime
    event.params.data.price = event.params.data.price * 0.8;
  },

  afterCreate(event) {
    const { result, params } = event;

    // do something to the result;
  },
};
```

---

TITLE: Managing Strapi Collection Types with Strapi Client
DESCRIPTION: Illustrates various operations for managing collection-type resources using the Strapi Client's `collection()` method. It shows how to find multiple entries with filtering and sorting, retrieve a single entry by ID, create new entries, update existing ones, and delete entries, providing a comprehensive CRUD example.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/api/client.md#_snippet_7

LANGUAGE: javascript
CODE:

```
const articles = client.collection('articles');

// Fetch all english articles sorted by title
const allArticles = await articles.find({
  locale: 'en',
  sort: 'title',
});

// Fetch a single article
const singleArticle = await articles.findOne('article-document-id');

// Create a new article
const newArticle = await articles.create({ title: 'New Article', content: '...' });

// Update an existing article
const updatedArticle = await articles.update('article-document-id', { title: 'Updated Title' });

// Delete an article
await articles.delete('article-id');
```

---

TITLE: Authenticating Strapi REST/GraphQL API Requests with API Tokens
DESCRIPTION: This snippet details how to authenticate requests to Strapi's REST or GraphQL APIs using an API token. The token must be included in the `Authorization` header of the request, prefixed with `bearer`. Read-only API tokens are limited to `find` and `findOne` functions.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/static/llms-full.txt#_snippet_271

LANGUAGE: APIDOC
CODE:

```
HTTP Request Header:
  Authorization: bearer your-api-token

Description:
  API tokens allow users to authenticate REST and GraphQL API queries.
  They are useful for granting access to applications or individuals without managing user accounts.

Limitations:
  Read-only API tokens can only access `find` and `findOne` functions.
```

---

TITLE: Creating a Review Service in Strapi (JavaScript)
DESCRIPTION: This JavaScript code defines a custom Strapi service for the 'Review' content type, overriding the default `create` method. It retrieves user and request body context, queries the 'Restaurant' collection using `entityService.findMany` to find the relevant restaurant, and then creates a new 'Review' entry using `entityService.create`, populating the restaurant owner. This service is designed to be called from a controller, for example, `strapi.service('api::review.review').create(ctx)`, and requires proper error handling for cases like non-existent restaurants.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/backend-customization/examples/services-and-controllers.md#_snippet_2

LANGUAGE: JavaScript
CODE:

```
const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::review.review', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    const { body } = ctx.request;

    /**
     * Queries the Restaurants collection type
     * using the Entity Service API
     * to retrieve information about the restaurant.
     */
    const restaurants = await strapi.entityService.findMany(
      'api::restaurant.restaurant',
      {
        filters: {
          slug: body.restaurant,
        },
      }
    );

    /**
     * Creates a new entry for the Reviews collection type
     * and populates data with information about the restaurant's owner
     * using the Entity Service API.
     */
    const newReview = await strapi.entityService.create('api::review.review', {
      data: {
        note: body.note,
        content: body.content,
        restaurant: restaurants[0].id,
        author: user.id,
      },
      populate: ['restaurant.owner'],
    });

    return newReview;
  },
}));
```

---

TITLE: Removing Attributes Wrapper in GraphQL Responses
DESCRIPTION: This GraphQL query illustrates the simplified response structure achieved by removing the 'attributes' wrapper. This optimization applies to both queries and mutation responses, streamlining the data payload and reducing nesting.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/migration/v4-to-v5/breaking-changes/graphql-api-updated.md#_snippet_3

LANGUAGE: GraphQL
CODE:

```
{
  # collection fields can be renamed to _connection to get a v4 compat response
  restaurants_connection {
    data {
      id
      title
      image {
        data {
          id
          url
        }
      }
      # collection fields can be renamed to _connection to get a v4 compat response
      images_connection {
        data {
          id
          url
        }
      }
      xToOneRelation {
        data {
          id
          field
        }
      }
      # collection fields can be renamed to _connection to get a v4 compat response
      xToManyRelation_connection {
        data {
          id
          field
        }
      }
    }
    meta {
      pagination {
        page
        pageSize
      }
    }
  }
}
```

---

TITLE: Creating a New Review Submission Component in React
DESCRIPTION: This component provides a form for users to submit new reviews for restaurants. It uses Formik for form handling and NextUI for UI elements. Upon submission, it sends a POST request to the Strapi `/reviews` endpoint, authenticating the request with a JWT token stored in local storage. It expects 'note' (stars) and 'content' (review text) as inputs and sends them along with the restaurant slug to the API.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/backend-customization/examples/services-and-controllers.md#_snippet_0

LANGUAGE: JSX
CODE:

```
import { Button, Input, Textarea } from '@nextui-org/react';
import { useFormik } from 'formik';
import { useRouter } from 'next/router';
import React from 'react';
import { getStrapiURL } from '../../../../../utils';

const NewReview = () => {
  const router = useRouter();

  const { handleSubmit, handleChange, values } = useFormik({
    initialValues: {
      note: '',
      content: '',
    },
    onSubmit: async (values) => {
      /**
       * Queries Strapi REST API to reach the reviews endpoint
       * using the JWT previously stored in localStorage to authenticate
       */
      const res = await fetch(getStrapiURL('/reviews'), {
        method: 'POST',
        body: JSON.stringify({
          restaurant: router.query.slug,
          ...values,
        }),
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
    },
  });
  /**
   * Renders the form
   */
  return (
    <div className="my-6">
      <h1 className="font-bold text-2xl mb-3">Write your review</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
        <Input
          onChange={handleChange}
          name="note"
          type="number"
          min={1}
          max={5}
          label="Stars"
        />
        <Textarea
          name="content"
          onChange={handleChange}
          placeholder="What do you think about this restaurant?"
        />
        <Button
          type="submit"
          className="bg-primary text-white rounded-md self-start"
        >
          Send
        </Button>
      </form>
    </div>
  );
};

export default NewReview;
```

---

TITLE: Exporting Configuration as a Function with Environment Variables
DESCRIPTION: This snippet demonstrates the recommended way to export configuration values as a function, allowing access to the `env` utility. This enables dynamic configuration based on environment variables, providing a default value if the variable is not set. This approach enhances flexibility and security for sensitive data.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/configurations/guides/access-configuration-values.md#_snippet_3

LANGUAGE: JavaScript
CODE:

```
module.exports = ({ env }) => {
  return {
    mySecret: env('MY_SECRET_KEY', 'defaultSecretValue'),
  };
};
```

LANGUAGE: TypeScript
CODE:

```
export default ({ env }) => {
  return {
    mySecret: env('MY_SECRET_KEY', 'defaultSecretValue'),
  };
};
```

---

TITLE: Strapi REST API: Available Query Parameters
DESCRIPTION: Lists the available query parameters for Strapi's REST API, used for filtering, sorting, pagination, and selecting fields or relations. Parameters include `filters`, `locale`, `status`, `populate`, `fields`, `sort`, and `pagination`, all using bracket notation for encoding.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/static/llms-full.txt#_snippet_127

LANGUAGE: APIDOC
CODE:

```
Available REST API Query Parameters:

- filters
  Type: Object
  Description: Filter the response.
  Reference: /cms/api/rest/filters

- locale
  Type: String
  Description: Select a locale.
  Reference: /cms/api/rest/locale

- status
  Type: String
  Description: Select the Draft & Publish status.
  Reference: /cms/api/rest/status

- populate
  Type: String or Object
  Description: Populate relations, components, or dynamic zones.
  Reference: /cms/api/rest/populate-select#population

- fields
  Type: Array
  Description: Select only specific fields to display.
  Reference: /cms/api/rest/populate-select#field-selection

- sort
  Type: String or Array
  Description: Sort the response.
  Reference: /cms/api/rest/sort-pagination.md#sorting

- pagination
  Type: Object
  Description: Page through entries.
  Reference: /cms/api/rest/sort-pagination.md#pagination

Note: Query parameters use bracket notation (e.g., `param[subparam]`).
```

---

TITLE: Create a new Strapi project with npx
DESCRIPTION: Run this command in your terminal to initialize a new Strapi project named 'my-strapi-project'. This process includes logging in or signing up for Strapi Cloud, which automatically applies a 30-day trial of the Growth plan.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/quick-start.md#_snippet_0

LANGUAGE: bash
CODE:

```
npx create-strapi@latest my-strapi-project
```

---

TITLE: Sanitizing Query and Output in Strapi Controller (JavaScript)
DESCRIPTION: This JavaScript snippet demonstrates how to use `validateQuery`, `sanitizeQuery`, and `sanitizeOutput` within a Strapi core controller's `find` method. It ensures that incoming query parameters are validated and sanitized, and outgoing results are also sanitized before being transformed and returned. This leverages the built-in factory functions for data integrity.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/backend-customization/controllers.md#_snippet_4

LANGUAGE: JavaScript
CODE:

```
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::restaurant.restaurant', ({ strapi }) =>  ({
  async find(ctx) {
    await this.validateQuery(ctx);
    const sanitizedQueryParams = await this.sanitizeQuery(ctx);
    const { results, pagination } = await strapi.service('api::restaurant.restaurant').find(sanitizedQueryParams);
    const sanitizedResults = await this.sanitizeOutput(results, ctx);

    return this.transformResponse(sanitizedResults, { pagination });
  }
}));
```

---

TITLE: Example Response for Page-Based Pagination - JSON
DESCRIPTION: This JSON object illustrates a typical response structure for a page-based pagination request. It includes the `data` array containing the requested entries and a `meta.pagination` object detailing the current page, page size, total page count, and total number of entries.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/api/rest/sort-pagination.md#_snippet_6

LANGUAGE: JSON
CODE:

```
{
  "data": [
    // ...
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "pageCount": 5,
      "total": 48
    }
  }
}
```

---

TITLE: Implementing a Strapi Widget Component with Data Fetching (JavaScript)
DESCRIPTION: This JavaScript snippet demonstrates how to create a basic React widget component for Strapi. It uses `useState` and `useEffect` to manage loading, error, and data states, fetching data from a mock API endpoint. It also utilizes Strapi's `Widget.Loading`, `Widget.Error`, and `Widget.NoData` components for consistent UI feedback.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/admin-panel-customization/homepage.md#_snippet_3

LANGUAGE: javascript
CODE:

```
import React, { useState, useEffect } from 'react';
import { Widget } from '@strapi/admin/strapi-admin';

const MyWidget = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch your data here
    const fetchData = async () => {
      try {
        // Replace with your actual API call
        const response = await fetch('/my-plugin/data');
        const result = await response.json();

        setData(result);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Widget.Loading />;
  }

  if (error) {
    return <Widget.Error />;
  }

  if (!data || data.length === 0) {
    return <Widget.NoData />;
  }

  return (
    <div>
      {/* Your widget content here */}
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default MyWidget;
```

---

TITLE: Defining a Custom Public GET Route (JavaScript)
DESCRIPTION: This JavaScript snippet shows how to define a custom GET route that is publicly accessible in Strapi. By setting `auth: false` within the `config` object for the route, this specific endpoint (`/articles/customRoute`) will not require authentication. This is suitable for custom API endpoints that need to be exposed without security restrictions.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/backend-customization/routes.md#_snippet_17

LANGUAGE: JavaScript
CODE:

```
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/articles/customRoute',
      handler: 'api::api-name.controllerName.functionName', // or 'plugin::plugin-name.controllerName.functionName' for a plugin-specific controller
      config: {
        auth: false,
      },
    },
  ],
};
```

---

TITLE: Throwing an Error in Strapi Service (JavaScript)
DESCRIPTION: This example demonstrates how to wrap a core Strapi service and perform custom validation within the `create` method. It shows how to use `ApplicationError` from `@strapi/utils` to prevent entity creation if validation fails, returning a custom error message.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/error-handling.md#_snippet_6

LANGUAGE: javascript
CODE:

```
const { errors } = require('@strapi/utils');
const { ApplicationError } = errors;
const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::restaurant.restaurant', ({ strapi }) =>  ({
  async create(params) {
    let okay = false;

    // Throwing an error will prevent the restaurant from being created
    if (!okay) {
      throw new errors.ApplicationError('Something went wrong', { foo: 'bar' });
    }

    const result = await super.create(params);

    return result;
  }
});
```

---

TITLE: Fetching Strapi Content with Draft Mode Support in Next.js (TypeScript)
DESCRIPTION: This TypeScript utility function `fetchContentType` fetches data from Strapi, dynamically adjusting the API call to include a `status=draft` parameter if Next.js draft mode is enabled. It uses `next/headers` for `draftMode` and `qs` for query string serialization. The function handles API responses and errors, providing a robust way to retrieve either published or draft content.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/features/preview.md#_snippet_15

LANGUAGE: TypeScript
CODE:

```
import { draftMode } from "next/headers";
import qs from "qs";

export default async function fetchContentType(
  contentType: string,
  params: Record = {}
): Promise {
  // Check if Next.js draft mode is enabled
  const { isEnabled: isDraftMode } = draftMode();

  try {
    const queryParams = { ...params };
    // Add status=draft parameter when draft mode is enabled
    if (isDraftMode) {
      queryParams.status = "draft";
    }

    const url = `${baseURL}/${contentType}?${qs.stringify(queryParams)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch data from Strapi (url=${url}, status=${response.status})`
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching content:", error);
    throw error;
  }
}
```

---

TITLE: Uploading Files to Strapi with Node.js
DESCRIPTION: This example illustrates how to upload a file from a Node.js environment to Strapi. It uses 'formdata-node' and 'node-fetch' to create a FormData object from a local file blob and send it to the /api/upload endpoint.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/api/rest/upload.md#_snippet_1

LANGUAGE: JavaScript
CODE:

```
import { FormData } from 'formdata-node';
import fetch, { blobFrom } from 'node-fetch';

const file = await blobFrom('./1.png', 'image/png');
const form = new FormData();

form.append('files', file, "1.png");

const response = await fetch('http://localhost:1337/api/upload', {
  method: 'post',
  body: form,
});
```

---

TITLE: Strapi REST API: Populate and Field Selection Overview
DESCRIPTION: Explains the usage of `populate` and `fields` parameters in Strapi's REST API. By default, relations, media fields, components, and dynamic zones are not populated. The `populate` parameter is used to include these fields, while the `fields` parameter is used to return only specific fields in the query results.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/static/llms-full.txt#_snippet_128

LANGUAGE: APIDOC
CODE:

```
REST API Population & Field Selection Overview:

Default Behavior:
- The REST API does not populate any relations, media fields, components, or dynamic zones by default.

Parameter: populate
  Purpose: Used to explicitly include (populate) relations, media fields, components, or dynamic zones in the query results.
  Reference: See 'populate' parameter in the API Parameters section.

Parameter: fields (also referred to as 'select' in context)
  Purpose: Used to select and return only specific fields from the query results, reducing the payload size.
  Reference: See 'fields' parameter in the API Parameters section.
```

---

TITLE: Strapi Database Transaction API Usage
DESCRIPTION: Illustrates the usage of the experimental `strapi.db.transaction` API in Strapi 5. This JavaScript example demonstrates how to wrap multiple `strapi.entityService` or `strapi.db.query` operations within a transaction block, ensuring that all operations are committed together or rolled back if any fail, maintaining data integrity.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/static/llms-full.txt#_snippet_263

LANGUAGE: javascript
CODE:

```
await strapi.db.transaction(async ({ trx, rollback, commit, onCommit, onRollback }) => {
  // It will implicitly use the transaction
  await strapi.entityService.create();
  await strapi.entityService.create();
});
```

---

TITLE: Implementing Strapi Middleware for Google Sheet View Tracking - JavaScript
DESCRIPTION: This middleware tracks restaurant views by interacting with a Google Sheet. It initializes a Google Sheet client, fetches restaurant details, reads existing analytics data, updates view counts if the restaurant exists, or adds a new entry if it's new. It then calls `next()` to continue the request flow.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/backend-customization/examples/middlewares.md#_snippet_2

LANGUAGE: JavaScript
CODE:

```
module.exports = (config, { strapi }) => {
  return async (context, next) => {
    // Generating google sheet client
    const { readGoogleSheet, updateoogleSheet, writeGoogleSheet } =
      await createGoogleSheetClient({
        keyFile: serviceAccountKeyFile,
        range,
        sheetId,
        tabName,
      });

    // Get the restaurant ID from the params in the URL
    const restaurantId = context.params.id;
    const restaurant = await strapi.entityService.findOne(
      'api::restaurant.restaurant',
      restaurantId
    );

    // Read the spreadsheet to get the current data
    const restaurantAnalytics = await readGoogleSheet();

    /**
     * The returned data comes in the shape [1, "Mint Lounge", 23],
     * and we need to transform it into an object: {id: 1, name: "Mint Lounge", views: 23, cellNum: 2}
     */
    const requestedRestaurant =
      transformGSheetToObject(restaurantAnalytics)[restaurantId];

    if (requestedRestaurant) {
      await updateoogleSheet(
        `${VIEWS_CELL}${requestedRestaurant.cellNum}:${VIEWS_CELL}${requestedRestaurant.cellNum}`,
        [[Number(requestedRestaurant.views) + 1]]
      );
    } else {
      /** If we don't have the restaurant in the spreadsheet already,
       * we create it with 1 view.
       */
      const newRestaurant = [[restaurant.id, restaurant.name, 1]];
      await writeGoogleSheet(newRestaurant);
    }

    // Call next to continue with the flow and get to the controller
    await next();
  };
};
```

---

TITLE: Setting Cache-Control Header in Strapi Cloud (TypeScript)
DESCRIPTION: This TypeScript function, using `express` types, illustrates how to set the `Cache-Control` header in an HTTP response for a dynamic Strapi Cloud application. It sets the caching duration to one day (86400 seconds), enabling CDN caching for improved performance and reduced server load. This is essential for optimizing the delivery of dynamic content.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cloud/getting-started/caching.md#_snippet_1

LANGUAGE: TypeScript
CODE:

```
import { Request, Response } from 'express';

function myHandler(req: Request, res: Response) {
  // Set the Cache-Control header to cache responses for 1 day
  res.setHeader('Cache-Control', 'max-age=86400');

  // Add your logic to generate the response here
}
```

---

TITLE: Populating Nested Relations with Object Syntax in Strapi
DESCRIPTION: This snippet demonstrates how to populate relations several levels deep using an object-based `populate` parameter. It fetches the `category` relation and then further populates its nested `restaurants` relation, useful for complex data structures.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/api/rest/guides/understanding-populate.md#_snippet_4

LANGUAGE: JavaScript
CODE:

```
{
  populate: {
    category: {
      populate: ['restaurants'],
    },
  },
}
```

---

TITLE: Uploading Files Linked to Strapi Entry with HTML Form
DESCRIPTION: This snippet provides an HTML form and JavaScript code to upload files and link them to a specific Strapi content entry. It includes hidden input fields for 'ref' (model UID), 'refId' (entry ID), and 'field' (attribute name) to establish the relationship.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/api/rest/upload.md#_snippet_2

LANGUAGE: HTML
CODE:

```
<form>
  <!-- Can be multiple files if you setup "collection" instead of "model" -->
  <input type="file" name="files" />
  <input type="text" name="ref" value="api::restaurant.restaurant" />
  <input type="text" name="refId" value="5c126648c7415f0c0ef1bccd" />
  <input type="text" name="field" value="cover" />
  <input type="submit" value="Submit" />
</form>
```

LANGUAGE: JavaScript
CODE:

```
const form = document.querySelector('form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    await fetch('/api/upload', {
      method: 'post',
      body: new FormData(e.target)
    });
  });
```

---

TITLE: Building Strapi Admin Panel for Production (NPM)
DESCRIPTION: This Bash command builds the Strapi administration panel for a production environment using npm. By setting `NODE_ENV` to `production`, the build process optimizes the admin panel's assets for performance and removes development-specific features, which is essential for a production deployment.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/deployment.md#_snippet_3

LANGUAGE: Bash
CODE:

```
NODE_ENV=production npm run build
```

---

TITLE: Casting Environment Variables with Strapi's env() Utility
DESCRIPTION: This comprehensive snippet showcases various methods of the env() utility for casting environment variables to specific data types. It includes examples for casting to integer (env.int), float (env.float), boolean (env.bool), JSON object (env.json), array (env.array), date (env.date), and validating against a set of union types (env.oneOf), along with providing default values.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/configurations/guides/access-cast-environment-variables.md#_snippet_4

LANGUAGE: js
CODE:

```
// Returns the env if defined without casting it
env('VAR', 'default');

// Cast to integer (using parseInt)
env.int('VAR', 0);

// Cast to float (using parseFloat)
env.float('VAR', 3.14);

// Cast to boolean (check if the value is equal to 'true')
env.bool('VAR', true);

// Cast to JS object (using JSON.parse)
env.json('VAR', { key: 'value' });

// Cast to array (syntax: ENV_VAR=[value1, value2, value3] | ENV_VAR=["value1", "value2", "value3"])
env.array('VAR', [1, 2, 3]);

// Cast to date (using new Date(value))
env.date('VAR', new Date());

// Returns the env matching oneOf union types
env.oneOf('UPLOAD_PROVIDER', ['local', 'aws'], 'local')
```

---

TITLE: Running Strapi Application Locally
DESCRIPTION: These commands start the Strapi application in development mode using either Yarn or NPM. They allow developers to run their Strapi project locally, access the admin panel, and interact with the API.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/installation/cli.md#_snippet_5

LANGUAGE: bash
CODE:

```
yarn develop
```

LANGUAGE: bash
CODE:

```
npm run develop
```

---

TITLE: Creating a New Strapi Project with TypeScript (CLI)
DESCRIPTION: This command initializes a new Strapi application with TypeScript support. It sets up the necessary configuration and dependencies for a type-safe development environment. Users can choose between Yarn or NPM for package management.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/typescript.md#_snippet_0

LANGUAGE: bash
CODE:

```
yarn create strapi-app my-project --typescript
```

LANGUAGE: bash
CODE:

```
npx create-strapi-app@latest my-project --typescript
```

---

TITLE: Building Strapi Admin Panel for Production (Yarn)
DESCRIPTION: This Bash command builds the Strapi administration panel for a production environment using Yarn. Setting `NODE_ENV` to `production` ensures that the build process optimizes the assets for performance and removes development-specific features. This step is a prerequisite before launching the server in production.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/deployment.md#_snippet_2

LANGUAGE: Bash
CODE:

```
NODE_ENV=production yarn build
```

---

TITLE: Configuring Strapi Plugins in JavaScript
DESCRIPTION: This snippet demonstrates how to configure Strapi plugins using JavaScript in the `./config/plugins.js` file. It shows examples of enabling a default plugin (`i18n`), enabling and configuring a custom local plugin (`myplugin`) with `enabled`, `resolve`, and `config` parameters, and disabling an installed plugin (`my-other-plugin`). The `env` object provides access to environment variables.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/configurations/plugins.md#_snippet_0

LANGUAGE: JavaScript
CODE:

```
module.exports = ({ env }) => ({
  // enable a plugin that doesn't require any configuration
  i18n: true,

  // enable a custom plugin
  myplugin: {
    // my-plugin is going to be the internal name used for this plugin
    enabled: true,
    resolve: './src/plugins/my-local-plugin',
    config: {
      // user plugin config goes here
    },
  },

  // disable a plugin
  'my-other-plugin': {
    enabled: false // plugin installed but disabled
  }
});
```

---

TITLE: Strapi REST API Endpoints for Single Types
DESCRIPTION: Defines the automatically generated REST API endpoints for Strapi single types, using a singular API ID. This includes operations for retrieving, updating/creating, and deleting a single document.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/api/rest.md#_snippet_1

LANGUAGE: APIDOC
CODE:

```
Method   | URL                   | Description
-------- | --------------------- | ------------------------------------------
`GET`    | `/api/:singularApiId` | [Get a document](#get)
`PUT`    | `/api/:singularApiId` | [Update/Create a document](#update)
`DELETE` | `/api/:singularApiId` | [Delete a document](#delete)
```

---

TITLE: Strapi Client Collection Type API Reference
DESCRIPTION: This section details the methods available for interacting with Strapi collection types using the `client.collection()` method. It includes functions for fetching multiple documents, retrieving a single document, and performing create, update, and delete operations.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/static/llms-full.txt#_snippet_22

LANGUAGE: APIDOC
CODE:

```
CollectionTypeManager:
  find(queryParams?: object): Promise<any[]>
    Description: Fetch multiple documents with optional filtering, sorting, or pagination.
  findOne(documentID: string, queryParams?: object): Promise<any>
    Description: Retrieve a single document by its unique ID.
  create(data: object, queryParams?: object): Promise<any>
    Description: Create a new document in the collection.
  update(documentID: string, data: object, queryParams?: object): Promise<any>
    Description: Update an existing document.
  delete(documentID: string, queryParams?: object): Promise<any>
    Description: Update an existing document.
```

---

TITLE: Filtering with $gte Operator in Strapi Entity Service (JavaScript)
DESCRIPTION: Filters entries where the specified attribute is greater than or equal to the input value. This example retrieves articles with a rating greater than or equal to 5 using the `strapi.entityService.findMany` method.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/api/entity-service/filter.md#_snippet_16

LANGUAGE: JavaScript
CODE:

```
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    rating: {
      $gte: 5,
    },
  },
});
```

---

TITLE: Making Authenticated API Requests with JWT in JavaScript
DESCRIPTION: This snippet demonstrates how to use a JSON Web Token (JWT) to make authenticated API requests to a Strapi backend. It shows how to include the JWT in the 'Authorization' header as a Bearer token using Axios for a GET request to the '/posts' endpoint, and how to handle success or error responses.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/static/llms-full.txt#_snippet_292

LANGUAGE: js
CODE:

```
const token = 'YOUR_TOKEN_HERE';

// Request API.
axios
  .get('http://localhost:1337/posts', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then(response => {
    // Handle success.
    console.log('Data: ', response.data);
  })
  .catch(error => {
    // Handle error.
    console.log('An error occurred:', error.response);
  });
```

---

TITLE: Migrating Query Parameter Conversion in Strapi
DESCRIPTION: This snippet illustrates the migration of query parameter conversion utilities from Strapi v4 to Strapi 5. In Strapi v4, `convertQueryParams` was directly imported and used for various query transformations. In Strapi 5, these functionalities are now exposed as a service via `strapi.get('query-params').transform()`, requiring the Strapi application context.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/migration/v4-to-v5/breaking-changes/strapi-utils-refactored.md#_snippet_0

LANGUAGE: JavaScript
CODE:

```
// Strapi v4
import { convertQueryParams } from '@strapi/utils';

convertQueryParams.convertSortQueryParams(...); // now private function to simplify the api
convertQueryParams.convertStartQueryParams(...); // now private function to simplify the api
convertQueryParams.convertLimitQueryParams(...); // now private function to simplify the api
convertQueryParams.convertPopulateQueryParams(...); // now private function to simplify the api
convertQueryParams.convertFiltersQueryParams(...); // now private function to simplify the api
convertQueryParams.convertFieldsQueryParams(...); // now private function to simplify the api
convertQueryParams.convertPublicationStateParams(...); // now private function to simplify the api

convertQueryParams.transformParamsToQuery(...); // becomes the example below

// Strapi 5
// Those utils required the strapi app context, so we decided to expose a strapi service for it
strapi.get('query-params').transform();
```

---

TITLE: Finding a Single Entry with Strapi Entity Service API (JavaScript)
DESCRIPTION: This snippet demonstrates how to use the `findOne()` method of the Strapi Entity Service API to retrieve a single entry. It specifies the content type `api::article.article` and an entry ID of `1`. It also uses `fields` to select `title` and `description`, and `populate` to include the `category` relation.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/api/entity-service/crud.md#_snippet_0

LANGUAGE: JavaScript
CODE:

```
const entry = await strapi.entityService.findOne('api::article.article', 1, {
  fields: ['title', 'description'],
  populate: { category: true },
});
```

---

TITLE: Extending Strapi Core Service - delete() for Collection Type (JavaScript)
DESCRIPTION: This snippet illustrates how to extend the 'delete' method for a Strapi collection type service. It allows for custom logic to be executed before and after the deletion of an entry, which can be used for cascading deletes, logging, or other cleanup operations.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/backend-customization/services.md#_snippet_10

LANGUAGE: js
CODE:

```
async delete(documentId, params) {
  // some logic here
  const result = await super.delete(documentId, params);
  // some more logic

  return result;
}
```

---

TITLE: Customizing Strapi Core Controllers (JS/TS)
DESCRIPTION: This snippet demonstrates how to customize Strapi core controllers using `createCoreController`. It illustrates three common patterns: creating a completely custom action, wrapping an existing core action to add pre/post-processing logic, and replacing a core action while ensuring proper query and output sanitization. Dependencies include `@strapi/strapi` factories.
SOURCE: https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/backend-customization/controllers.md#_snippet_0

LANGUAGE: JavaScript
CODE:

```
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::restaurant.restaurant', ({ strapi }) =>  ({
  // Method 1: Creating an entirely custom action
  async exampleAction(ctx) {
    try {
      ctx.body = 'ok';
    } catch (err) {
      ctx.body = err;
    }
  },

  // Method 2: Wrapping a core action (leaves core logic in place)
  async find(ctx) {
    // some custom logic here
    ctx.query = { ...ctx.query, local: 'en' }

    // Calling the default core action
    const { data, meta } = await super.find(ctx);

    // some more custom logic
    meta.date = Date.now()

    return { data, meta };
  },

  // Method 3: Replacing a core action with proper sanitization
  async find(ctx) {
    // validateQuery (optional)
    // to throw an error on query params that are invalid or the user does not have access to
    await this.validateQuery(ctx);

    // sanitizeQuery to remove any query params that are invalid or the user does not have access to
    // It is strongly recommended to use sanitizeQuery even if validateQuery is used
    const sanitizedQueryParams = await this.sanitizeQuery(ctx);
    const { results, pagination } = await strapi.service('api::restaurant.restaurant').find(sanitizedQueryParams);
    const sanitizedResults = await this.sanitizeOutput(results, ctx);

    return this.transformResponse(sanitizedResults, { pagination });
  }
}));
```

LANGUAGE: TypeScript
CODE:

```
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::restaurant.restaurant', ({ strapi }) =>  ({
  // Method 1: Creating an entirely custom action
  async exampleAction(ctx) {
    try {
      ctx.body = 'ok';
    } catch (err) {
      ctx.body = err;
    }
  },

  // Method 2: Wrapping a core action (leaves core logic in place)
  async find(ctx) {
    // some custom logic here
    ctx.query = { ...ctx.query, local: 'en' }

    // Calling the default core action
    const { data, meta } = await super.find(ctx);

    // some more custom logic
    meta.date = Date.now()

    return { data, meta };
  },

  // Method 3: Replacing a core action with proper sanitization
  async find(ctx) {
    // validateQuery (optional)
    // to throw an error on query params that are invalid or the user does not have access to
    await this.validateQuery(ctx);

    // sanitizeQuery to remove any query params that are invalid or the user does not have access to
    // It is strongly recommended to use sanitizeQuery even if validateQuery is used
    const sanitizedQueryParams = await this.sanitizeQuery(ctx);
    const { results, pagination } = await strapi.service('api::restaurant.restaurant').find(sanitizedQueryParams);

    // sanitizeOutput to ensure the user does not receive any data they do not have access to
    const sanitizedResults = await this.sanitizeOutput(results, ctx);

    return this.transformResponse(sanitizedResults, { pagination });
  }
}));
```
