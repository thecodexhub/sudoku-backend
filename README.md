# Sudoku Backend

[![License: MIT][license_badge]][license_link]

Backend project for Sudoku made using [Genkit][genkit_link], and deployed on [Vercel][vercel_link].

✨ Checkout the frontend application made using Flutter in this [Github Repository][flutter_app].

## 🚀 Getting Started

To run this project, genkit is required to be installed. Read through the [documentation][genkit_link] for more information.

```sh
npm install -g genkit
```

The next step is to set-up the environment variables. Checkout the [.env.example][env_example] file and copy the content over to a `.env` file.

- The `GOOGLE_API_KEY` represents the AI API Key that can be created from [Google AI Studio][google_ai_studio].
- The `API_KEY` represents a random key used for authorization. The frontend or the client is expected to send this key via **x-api-key** header.

Read more about Non-Firebase HTTP Authorization in the [documentation][authorization].

## 🧩 Run the Server

This project can be run via Genkit Developer UI. To start the UI, use the following command:

```sh
genkit start
# or
npm run genkit
```

Review the [documentation][genkit_getting_started] for detailed explanation and samples.

Alternatively, this project can be run as an express project. Follow the below commands:

```sh
npm run build
npm start
```

## 🎯 Deploy

This project is deployed on [Vercel][vercel_link].

Checkout the [vercel.json][vercel_config] file that holds the configurations used for the vercel deployment.

Additionally, go through this official [documentation][genkit_deploy] on how to deploy a Firebase Genkit app on any Node.js platform.


## ✅ Todo Checklist

- [ ] Update generate-hint prompt to make better hints. [_In current scenario, sometimes it generates invalid hints (in terms of wrong answer, incorrect cell co-ordinates, less meaningful logic explanations)_]
- [ ] Add a better authentication and authorization logic.

[flutter_app]: https://github.com/thecodexhub/sudoku
[license_badge]: https://img.shields.io/badge/license-MIT-blue.svg
[license_link]: https://opensource.org/licenses/MIT
[genkit_link]: https://firebase.google.com/docs/genkit
[genkit_getting_started]: https://firebase.google.com/docs/genkit/get-started
[genkit_deploy]: https://firebase.google.com/docs/genkit/deploy-node
[vercel_link]: https://vercel.com/docs
[google_ai_studio]: https://aistudio.google.com/app/apikey
[env_example]: https://github.com/thecodexhub/sudoku-backend/blob/main/.env.example
[authorization]: https://firebase.google.com/docs/genkit/auth#non-firebase_http_authorization
[vercel_config]: https://github.com/thecodexhub/sudoku-backend/blob/main/vercel.json
