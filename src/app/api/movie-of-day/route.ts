import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // OMDb API key - ücretsiz tier için günde 1000 istek
    const apiKey = process.env.OMDB_API_KEY || 'demo'; // Demo key ile test edebilirsiniz
    
    // Popüler filmlerin IMDb ID'leri
    const popularMovies = [
      'tt0111161', // The Shawshank Redemption
      'tt0068646', // The Godfather
      'tt0071562', // The Godfather Part II
      'tt0468569', // The Dark Knight
      'tt0050083', // 12 Angry Men
      'tt0108052', // Schindler's List
      'tt0167260', // The Lord of the Rings: The Return of the King
      'tt0110912', // Pulp Fiction
      'tt0120737', // The Lord of the Rings: The Fellowship of the Ring
      'tt0060196', // The Good, the Bad and the Ugly
      'tt0109830', // Forrest Gump
      'tt0137523', // Fight Club
      'tt0167261', // The Lord of the Rings: The Two Towers
      'tt0080684', // Star Wars: Episode V - The Empire Strikes Back
      'tt0073486', // One Flew Over the Cuckoo's Nest
      'tt0099685', // Goodfellas
      'tt0047478', // Seven Samurai
      'tt0114369', // Se7en
      'tt0102926', // The Silence of the Lambs
      'tt0038650', // It's a Wonderful Life
      'tt0076759', // Star Wars: Episode IV - A New Hope
      'tt0047396', // Rear Window
      'tt0103064', // Terminator 2: Judgment Day
      'tt0054215', // Psycho
      'tt0088763', // Back to the Future
      'tt0118799', // Life Is Beautiful
      'tt0078748', // Alien
      'tt0120586', // American History X
      'tt0105236', // Reservoir Dogs
      'tt0021749', // City Lights
      'tt0034583', // Casablanca
      'tt0043014', // Sunset Boulevard
      'tt0078788', // Apocalypse Now
      'tt0057012', // Dr. Strangelove
      'tt0110413', // Léon: The Professional
      'tt0042192', // All About Eve
      'tt0040897', // The Treasure of the Sierra Madre
      'tt0042876', // Raging Bull
      'tt0045152', // Singin' in the Rain
      'tt0033467', // Citizen Kane
      'tt0040522', // Bicycle Thieves
      'tt0044741', // Ikiru
      'tt0043014', // Sunset Boulevard
      'tt0042192', // All About Eve
      'tt0040897', // The Treasure of the Sierra Madre
      'tt0042876', // Raging Bull
      'tt0045152', // Singin' in the Rain
      'tt0033467', // Citizen Kane
      'tt0040522', // Bicycle Thieves
      'tt0044741', // Ikiru
    ];

    // Günün tarihine göre deterministik rastgele seçim
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const movieIndex = dayOfYear % popularMovies.length;
    const selectedMovieId = popularMovies[movieIndex];

    // OMDb API'den film bilgilerini al
    const omdbResponse = await fetch(
      `https://www.omdbapi.com/?i=${selectedMovieId}&apikey=${apiKey}&plot=full`
    );

    if (!omdbResponse.ok) {
      throw new Error('OMDb API error');
    }

    const movieData = await omdbResponse.json();

    if (movieData.Response === 'False') {
      throw new Error(movieData.Error || 'Film bulunamadı');
    }

    return NextResponse.json(movieData);
  } catch (error) {
    console.error('Movie of day API error:', error);
    return NextResponse.json(
      { error: 'Film bilgileri alınamadı' },
      { status: 500 }
    );
  }
}
