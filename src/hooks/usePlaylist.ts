import { useState, useCallback } from 'react';

export interface Song {
  id: string;
  title: string;
  artist?: string;
  url: string;
  duration?: number;
}

interface UsePlaylistProps {
  initialSongs?: Song[];
}

export const usePlaylist = ({ initialSongs = [] }: UsePlaylistProps = {}) => {
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  const currentSong = songs[currentSongIndex] || null;

  const addSong = useCallback((song: Song) => {
    setSongs(prev => [...prev, song]);
  }, []);

  const removeSong = useCallback((songId: string) => {
    setSongs(prev => prev.filter(song => song.id !== songId));
    if (currentSongIndex >= songs.length - 1 && currentSongIndex > 0) {
      setCurrentSongIndex(prev => prev - 1);
    }
  }, [currentSongIndex, songs.length]);

  const selectSong = useCallback((index: number) => {
    if (index >= 0 && index < songs.length) {
      setCurrentSongIndex(index);
    }
  }, [songs.length]);

  const nextSong = useCallback(() => {
    if (currentSongIndex < songs.length - 1) {
      setCurrentSongIndex(prev => prev + 1);
    }
  }, [currentSongIndex, songs.length]);

  const previousSong = useCallback(() => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex(prev => prev - 1);
    }
  }, [currentSongIndex]);

  const addSongs = useCallback((newSongs: Song[]) => {
    setSongs(prev => [...prev, ...newSongs]);
  }, []);

  return {
    songs,
    currentSongIndex,
    currentSong,
    addSong,
    removeSong,
    selectSong,
    nextSong,
    previousSong,
    addSongs,
    setSongs,
  };
};

export default usePlaylist;
