import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock film verileri - API key olmadığında kullanılacak
    const mockMovies = [
      {
        Title: "The Shawshank Redemption",
        Year: "1994",
        Rated: "R",
        Released: "14 Oct 1994",
        Runtime: "142 min",
        Genre: "Drama",
        Director: "Frank Darabont",
        Writer: "Stephen King, Frank Darabont",
        Actors: "Tim Robbins, Morgan Freeman, Bob Gunton",
        Plot: "Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.",
        Language: "English",
        Country: "United States",
        Awards: "Nominated for 7 Oscars. 21 wins & 44 nominations total",
        Poster: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwMjU5MDQ@._V1_SX300.jpg",
        Ratings: [
          { Source: "Internet Movie Database", Value: "9.3/10" },
          { Source: "Rotten Tomatoes", Value: "91%" },
          { Source: "Metacritic", Value: "80/100" }
        ],
        Metascore: "80",
        imdbRating: "9.3",
        imdbVotes: "2,847,123",
        imdbID: "tt0111161",
        Type: "movie",
        DVD: "27 Jan 1998",
        BoxOffice: "$28,767,189",
        Production: "N/A",
        Website: "N/A",
        Response: "True"
      },
      {
        Title: "The Godfather",
        Year: "1972",
        Rated: "R",
        Released: "24 Mar 1972",
        Runtime: "175 min",
        Genre: "Crime, Drama",
        Director: "Francis Ford Coppola",
        Writer: "Mario Puzo, Francis Ford Coppola",
        Actors: "Marlon Brando, Al Pacino, James Caan",
        Plot: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
        Language: "English, Italian, Latin",
        Country: "United States",
        Awards: "Won 3 Oscars. 31 wins & 30 nominations total",
        Poster: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYjZlODYkZTk3YjEwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
        Ratings: [
          { Source: "Internet Movie Database", Value: "9.2/10" },
          { Source: "Rotten Tomatoes", Value: "97%" },
          { Source: "Metacritic", Value: "100/100" }
        ],
        Metascore: "100",
        imdbRating: "9.2",
        imdbVotes: "1,912,456",
        imdbID: "tt0068646",
        Type: "movie",
        DVD: "11 Sep 2001",
        BoxOffice: "$134,966,411",
        Production: "N/A",
        Website: "N/A",
        Response: "True"
      },
      {
        Title: "The Dark Knight",
        Year: "2008",
        Rated: "PG-13",
        Released: "18 Jul 2008",
        Runtime: "152 min",
        Genre: "Action, Crime, Drama",
        Director: "Christopher Nolan",
        Writer: "Jonathan Nolan, Christopher Nolan, David S. Goyer",
        Actors: "Christian Bale, Heath Ledger, Aaron Eckhart",
        Plot: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        Language: "English, Mandarin",
        Country: "United States, United Kingdom",
        Awards: "Won 2 Oscars. 163 wins & 163 nominations total",
        Poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
        Ratings: [
          { Source: "Internet Movie Database", Value: "9.0/10" },
          { Source: "Rotten Tomatoes", Value: "94%" },
          { Source: "Metacritic", Value: "84/100" }
        ],
        Metascore: "84",
        imdbRating: "9.0",
        imdbVotes: "2,847,123",
        imdbID: "tt0468569",
        Type: "movie",
        DVD: "09 Dec 2008",
        BoxOffice: "$534,987,076",
        Production: "N/A",
        Website: "N/A",
        Response: "True"
      }
    ];

    // Günün tarihine göre deterministik rastgele seçim
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const movieIndex = dayOfYear % mockMovies.length;
    const selectedMovie = mockMovies[movieIndex];

    return NextResponse.json(selectedMovie);
  } catch (error) {
    console.error('Movie of day API error:', error);
    return NextResponse.json(
      { error: 'Film bilgileri alınamadı' },
      { status: 500 }
    );
  }
}
