# Travel Explorer ✈️

![Travel Explorer Screenshot](./assets/appSS.png)

A dynamic and responsive travel information web application that allows users to discover amazing destinations around the world. Get real-time weather data, view stunning photos, and find information on famous attractions for any city you search for.

**🔗 Live Demo:** **[travel-exploro.vercel.app](https://travel-exploro.vercel.app/)**

---

## 📋 Table of Contents

- [Features](#-features)
- [Technologies Used](#-technologies-used)
- [Setup and Installation](#-setup-and-installation)
- [Configuration](#-configuration)
- [Acknowledgments](#-acknowledgments)

---

## ✨ Features

- **City Search:** Search for any city in the world to get detailed information.
- **Real-Time Weather:** Fetches and displays current weather conditions (temperature, humidity, wind speed) for the searched city using the OpenWeatherMap API.
- **High-Quality Photos:** Displays beautiful, high-resolution images of the searched destination from the Unsplash API.
- **Featured Destinations:** Showcases popular travel spots like Paris, Tokyo, London, and New York on the homepage.
- **Responsive Design:** A clean and modern user interface built with Bootstrap that works seamlessly on all devices (mobile, tablet, and desktop).

---

## 🛠️ Technologies Used

- **Backend:** Node.js, Express.js
- **Frontend:** EJS (Embedded JavaScript templates), HTML5, CSS3, Bootstrap 5
- **APIs:**
    - [OpenWeatherMap API](https://openweathermap.org/api) for real-time weather data.
    - [Unsplash API](https://unsplash.com/developers) for high-quality images.
- **Deployment:** Vercel

---

## 🚀 Setup and Installation

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/DhruvDwivedi1/travel-Explorer.git](https://github.com/DhruvDwivedi1/travel-Explorer.git)
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd travel-Explorer
    ```

3.  **Install the dependencies:**
    ```bash
    npm install
    ```

4.  **Set up environment variables:**
    Create a file named `.env` in the root of the project and add your API keys (see [Configuration](#-configuration) below).

5.  **Start the server:**
    ```bash
    npm start
    ```

6.  Open your browser and go to `http://localhost:3000`.

---

## ⚙️ Configuration

This project requires API keys from OpenWeatherMap and Unsplash to function correctly.

1.  Create a `.env` file in the root directory of the project.
2.  Add your API keys to the `.env` file as shown in the example below.

**`.env.example`**
OpenWeatherMap API Key
API_KEY_WEATHER=[Your_OpenWeatherMap_API_Key]

Unsplash API Key
API_KEY_UNSPLASH=[Your_Unsplash_Access_Key]

Port for the server to run on
PORT=3000


---

## 🙏 Acknowledgments

- This project was inspired by the desire to create useful and beautiful web applications.
- Special thanks to the providers of the free APIs that made this project possible: [OpenWeatherMap](https://openweathermap.org/) and [Unsplash](https://unsplash.com/).

---

**Connect with me:**

[![LinkedIn](https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/dhruvdwivedi0001)
[![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/DhruvDwivedi1)
```
