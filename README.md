## Socialley

[Socialley Demo](https://user-images.githubusercontent.com/85624034/229559473-f0787834-5fff-4dde-b52c-284dc8dfd67a.mp4)

<br />

<p align="center">
  <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" />&nbsp;
  <img src="https://img.shields.io/badge/NODEMON-%23323330.svg?style=for-the-badge&logo=nodemon&logoColor=%BBDEAD" />&nbsp;
  <img src="https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB" />&nbsp;
  <img src="https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white" />&nbsp;
  <img src="https://img.shields.io/badge/-GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white" />&nbsp;
  <img src="https://img.shields.io/badge/-ApolloGraphQL-311C87?style=for-the-badge&logo=apollo-graphql" />&nbsp;
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" />&nbsp;
  <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" />&nbsp;
  <img src="https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white" />&nbsp;
  <img src="https://img.shields.io/badge/Render-%46E3B7.svg?style=for-the-badge&logo=render&logoColor=white" />
</p>

Introducing Socialley, a powerful social media platform that brings users together through cutting-edge technology and a seamless user experience. With features like JWT authentication, collaborative filtering-based suggestions, instant messaging, and notifications through web sockets and GraphQL subscriptions, Socialley provides a secure and engaging space for users to connect and share content. The application also uses Cloudinary cloud storage for efficient media management and caching query results using dataloader for faster responses.

On the client side, Socialley uses Apollo Client as a state management library, offering users a smooth and responsive experience. Users can easily view suggested users and posts, like and comment on content, and mark posts as favorites. The search feature allows users to quickly find other users or content, and instant messaging makes it easy to communicate with friends and followers. Notifications keep users up-to-date on activity related to their posts, likes, comments, and follows, while the ability to follow and unfollow other users and view their following and followers lists provides users with the tools they need to build a strong community. Overall, Socialley is the ultimate social media platform, providing users with everything they need to connect, share, and grow together.

### Core server features
- [JWT](https://jwt.io/) authentication using access & refresh tokens
- Suggesting users and posts using an algorithm based on [collaborative filtering](https://en.wikipedia.org/wiki/Collaborative_filtering)
- Instant messaging and notifications using web sockets and [graphql subscriptions](https://www.npmjs.com/package/graphql-subscriptions)
- Caching query results using [dataloader](https://github.com/graphql/dataloader)
- [Cloudinary](https://cloudinary.com/) cloud storage
- Expose GraphQL API

### Core client features
- Uses  [Apollo Client](https://www.apollographql.com/docs/react/) as a state management library
- View suggested users and posts
- Like, comment and mark posts as favorite
- View liked and favorite posts
- View search history
- Search users
- Instant messaging
- View like, comment and follow notifications
- Create new posts
- Follow and unfollow users
- View following and followers for every user
- View post likes and comments

### Deployment: [socialley.onrender.com](https://socialley.onrender.com/)
At Socialley, I believe that deploying an application should be easy, reliable, and scalable. That's why I chose to deploy the API as a web service and power the client application with Create React App. To deploy the application, I turned to [Render](https://render.com/), a platform that offers the reliability, scalability, and ease of use that I was looking for.

One thing to note is that the API and the client application are served on different domains. The API is hosted on as a web service, while the client application is hosted on a different domain altogether. This approach provides added security and scalability benefits, as it allows me to scale the two parts of the application separately as needed.

One of the biggest benefits of Render is its reliability. Render's platform is built on top of top-tier cloud providers like AWS and Google Cloud, which means that the application is always up and running, even during times of high traffic. However, one caveat to keep in mind is that I am currently using the free version of Render to host my application. While this serves my purposes for a demo app, the free version requires the web service to be restarted periodically in order for the application to continue running.

If you would like to test the application and access a test account, please feel free to reach out to me at [davidcoderistov@gmail.com](mailto:davidcoderistov@gmail.com) and I will be happy to provide you with the necessary login credentials.

