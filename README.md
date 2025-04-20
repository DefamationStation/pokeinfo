# PokeInfo

PokeInfo is a React-based single-page web application that lets users browse, search, and view detailed information about Pokémon by consuming data from the [PokéAPI](https://pokeapi.co).

## Features

- Browse a list of Pokémon with images and basic info  
- Search Pokémon by name or ID  
- View detailed stats, abilities, types, and moves in a modal with tabbed navigation  
- Responsive design powered by Tailwind CSS  
- Custom React hooks for streamlined data fetching (e.g., `usePokemonDetails`)

## Tech Stack

- React  
- Vite  
- Tailwind CSS  
- Fetch API / Axios  
- PokéAPI

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-org>/pokeinfo.git
   cd pokeinfo
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:5173` (or the port shown in the console).

## Folder Structure

```plaintext
pokeinfo/
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── src/
│   ├── index.css
│   ├── main.jsx
│   ├── App.jsx
│   ├── constants/
│   │   └── typeColors.js
│   ├── hooks/
│   │   ├── usePokemonDetails.js
│   │   └── usePokemonList.js
│   ├── utils/
│   │   └── stat.js
│   └── components/
│       ├── MoveItem.jsx
│       ├── PokemonCard.jsx
│       ├── PokemonList.jsx
│       ├── PokemonModal.jsx
│       ├── SearchBar.jsx
│       └── tabs/
│           ├── DetailsTab.jsx
│           ├── MovesTab.jsx
│           └── StatsTab.jsx
└── README.md
```

## Contributing

1. Fork the repository  
2. Create a new branch (`git checkout -b feature/YourFeature`)  
3. Commit your changes (`git commit -m "feat: add X"`)  
4. Push to the branch (`git push origin feature/YourFeature`)  
5. Open a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
