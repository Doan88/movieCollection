// StAuth10244: I Thanh Truong Doan, 000918024 certify that this material is my original work. No other person's work has been used without due acknowledgement. I have not made my work available to anyone else.

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';

const url = 'http://localhost:3001/api'; // Backend API base URL

export default function App() {
  // State to store movies from the server
  const [movies,setMovies] = useState([]);
  // State to store movies temporarily before replacing collection
  const [tempMovies,setTempMovies] = useState([]);
  // State to manage the movie form inputs
  const [form,setForm] = useState({title: '', director: '', genre: '', year: '', rating: '', duration: ''});
  // Flag to toggle showing temporary collection
  const [showCollection, setShowCollection] = useState(false);
  // ID of the movie selected for editing or viewing
  const [selectedID, setSelectedId] = useState('');
  // Movie details for the selected ID
  const [selectedMovie, setSelectedMovie] = useState(null);
  
  // Fetch the current collection of movies from server
  const fetchMovies =  async () => {
    try {
      const response = await axios.get(url);
      setMovies(response.data);
    }
    catch (error) {
      console.error('Cannot fetch movies', error);
    }
  };

  // Fetch movies when the component mounts
  useEffect(() => {fetchMovies();}, [])

  // Handle input changes in the form
  const addFormInput = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };
  
  // Add a single movie to the server collection
  const addMovie = async () => {
    const {title, director, genre, year, rating, duration} = form;
    if (!title) {
      console.error('Title must be filled.');
      return;
    }
    try {
      // Send movie data to backend
      const response = await axios.post(url, {title, director: director || "N/A" , genre: genre || "N/A", year: year ? String(year) : "N/A", rating: rating ? String(rating) : "N/A", duration: duration ? String(duration) : "N/A"});

      // On success, clear form and refresh movie list
      if (response.data.status === 'CREATE ENTRY SUCCESSFUL') {
        setForm({title: '', director: '', genre: '', year: '', rating: '', duration: ''  });
        fetchMovies();
      }
    }
    catch (err)
    {
      console.error('Cannot add movie',err);
    }
  };

  // Add a movie to the temporary collection (not saved to server yet)
  const addTempMovie = () => {
    const {title, director, genre, year, rating, duration} = form;

    if (!title) {
      console.error('Title must be filled.');
      return;
    }

    const newMovie = {title, director: director || "N/A" , genre: genre || "N/A", year: year ? String(year) : "N/A", rating: rating ? String(rating) : "N/A", duration: duration ? String(duration) : "N/A"
    };

    setTempMovies(prev => [...prev,newMovie]);
    setForm({ title: '', director: '', genre: '', year: '', rating: '', duration: '' });
  };

  // Replace the entire movie collection with the temp collection
  const replaceCollection = async () => {
    if(tempMovies.length === 0) return;
    try {
      const response = await axios.put(url, tempMovies);
      if (response.data.status === 'REPLACE COLLECTION SUCCESSFUL') {
        setTempMovies([]);
        setShowCollection(false);
        // Refresh movie list after a brief pause
        setTimeout(() => {
          fetchMovies();
          setSelectedMovie(null);
        }, 300);
      }
      else {
        console.error('Cannot replace collection.');
      }
    }
    catch (error) {
      console.error('Cannot replace collection.');
    }
  };

  // Fetch movie by ID and set it as selected
  const selectMovie = async () => {
    if (!selectedID.trim()) {    
      return;
    }
    try {
      const response = await axios.get(`${url}/${selectedID}`);
      setSelectedMovie(response.data);      
      setSelectedId('');   
    }
    catch (err) {
      console.error('Cannot fetch movie.',err);    
      setSelectedMovie(null);
      setSelectedId('');
    }
  };

  // Edit movie details by ID using form data
  const editMovie = async (id) => {
    const {title, director, genre, year, rating, duration } = form;
  
    try {
      const response = await axios.put(`${url}/${id}`, {title, director: director || "N/A" , genre: genre || "N/A", year: year ? String(year) : "N/A", rating: rating ? String(rating) : "N/A", duration: duration ? String(duration) : "N/A"});
      if (response.data.status === 'UPDATE ITEM SUCCESSFUL') {
        setForm({title: '', director: '', genre: '', year: '', rating: '', duration: ''});  
        setSelectedMovie(null);     
        setSelectedId('');
        fetchMovies();
      }
    }
    catch (err) {
      console.error('Cannot edit movie.', err);
    }
  };

  // Delete a single movie by ID
  const deleteMovie = async (id) => {
    try {
      const response = await axios.delete(`${url}/${id}`);
      if (response.data.status === 'DELETE ITEM SUCCESSFUL') {
        fetchMovies();
      }
    }
    catch (err) {
      console.error('Cannot delete movie', err);
    }
  };

  // Delete the entire movie collection from the server
  const deleteAllMovies = async () => {
    try {
      const response = await axios.delete(url);
      if (response.data.status === 'DELETE COLLECTION SUCCESSFUL') {
        setMovies([]);
        setSelectedMovie(null);
      }
    }
    catch (err) {
      console.error('Cannot delete all movies.', err);
    }
  };

  return (
    <ScrollView style = {styles.container}>
      {/* Title of the app */}
      <Text style = {styles.title}>Favorite Movie Collection</Text>

      {/* Header row showing labels for form and temp movie list */}
      <View style = {styles.headerRow}>
        <Text style = {styles.headingForm}>Movie Form</Text>
        <Text style = {styles.headingTemp}>New Temp Movie Collection</Text>
      </View>

      {/* Main row containing the movie input form, buttons, and temp list */}
      <View style = {styles.formsRow}>

        {/* Movie input form */}
        <View style = {styles.addForm}> 
          {/* Input fields for movie details */}
          <Text style = {styles.inputHeading}>Title:</Text>       
          <TextInput
            style = {styles.input}
            placeholder = 'Title'
            value = {form.title}
            onChangeText = {text => addFormInput('title', text)}        
          />
          <Text style = {styles.inputHeading}>Director:</Text>
          <TextInput
            style = {styles.input}
            placeholder = 'Director'
            value = {form.director}
            onChangeText = {text => addFormInput('director', text)}        
          />
          <Text style = {styles.inputHeading}>Genre:</Text>
          <TextInput
            style = {styles.input}
            placeholder = 'Genre'
            value = {form.genre}
            onChangeText = {text => addFormInput('genre', text)}        
          />
          <Text style = {styles.inputHeading}>Year:</Text>
          <TextInput
            style = {styles.input}
            placeholder = 'Year(> 1900)'
            value = {form.year}
            onChangeText = {text => addFormInput('year', text)}        
          />
          <Text style = {styles.inputHeading}>Rating:</Text>
          <TextInput
            style = {styles.input}
            placeholder = 'Rating(0-10)'
            value = {form.rating}
            onChangeText = {text => addFormInput('rating', text)}        
          />
          <Text style = {styles.inputHeading}>Duration:</Text>
          <TextInput
            style = {styles.input}
            placeholder = 'Duration(minutes)'
            value = {form.duration}
            onChangeText = {text => addFormInput('duration', text)}        
          />    
        </View>

        {/* Column of action buttons */}
        <View style = {styles.buttonsCol}>
          <TouchableOpacity style = {styles.button} onPress = {addMovie}>
            <Text style = {styles.buttonText}>Add Movie</Text>
          </TouchableOpacity>
          <TouchableOpacity style = {styles.button} onPress = {addTempMovie}>
            <Text style = {styles.buttonText}>Add to Temp Collection</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress= {() => editMovie(selectedID)}>
            <Text style={styles.buttonText}>Update Movie</Text>
          </TouchableOpacity>
          <TouchableOpacity style = {styles.button} onPress = {replaceCollection}>
          <Text style = {styles.buttonText}>Replace Collection</Text>
          </TouchableOpacity>
          <TouchableOpacity style = {styles.button} onPress = {() => setShowCollection(true)}>
            <Text style = {styles.buttonText}>Show Collection</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteAllButton} onPress={deleteAllMovies}>
            <Text style={styles.buttonText}>Delete All</Text>
          </TouchableOpacity>
        </View>

        {/* Temporary movie collection list */}
        <View style = {styles.tempCol}>          
          <FlatList
            data = {tempMovies}
            keyExtractor = {(item, index) => index.toString()}
            renderItem = {({item, index}) => (
              <View style = {styles.tempMovieItem}>
                <Text style = {styles.tempText}>{`${index + 1}. Title: ${item.title} | Director: ${item.director} | Genre: ${item.genre} | Year: ${item.year} | Rating: ${item.rating} | Duration: ${item.duration}`}</Text>
              </View>
            )}
          />
        </View>
      </View>

      {/* Section to input an ID to select and view movie details */}
      <View style={styles.row}>
        <TextInput
          style={styles.idInput}
          placeholder={"Movie ID"}
          value={selectedID}
          onChangeText={text => {
            setSelectedId(text);
          }}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.showDetailsButton} onPress={() => {selectMovie(); setSelectedId('')}}>
          <Text style={styles.buttonText}>Show Details</Text>
        </TouchableOpacity>
      </View>

      {/* Display selected movie details if any */}
      {selectedMovie && (
        <View>
          <Text style={styles.selectedMovie}>{`ID: ${selectedMovie.id} | Title: ${selectedMovie.title} | Director: ${selectedMovie.director} | Genre: ${selectedMovie.genre} | Year: ${selectedMovie.year} | Rating: ${selectedMovie.rating} | Duration: ${selectedMovie.duration}`}</Text>
        </View>
      )}
      
      {/* Heading for the main movie collection list */}
      <Text style = {styles.headingCurrent}>Current Collection</Text>
   
      {/* Movie list */}
      {showCollection && (
        <>          
          <FlatList
            data = {movies}
            keyExtractor = {(item, index) => item.id.toString()}
            renderItem = {({item}) => (
              <View style = {styles.currentMovieItem}>
                <Text style = {styles.movieText}>
                  {`${item.id}. Title: ${item.title} | Director: ${item.director} | Genre: ${item.genre} | Year: ${item.year} | Rating: ${item.rating} | Duration: ${item.duration}`};
                </Text>
                {/* Edit and Delete buttons for each movie */}
                <View style = {styles.editDeleteButtons}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                      setForm({                         
                        title: item.title,
                        director: item.director,
                        genre: item.genre,
                        year: item.year,
                        rating: item.rating,
                        duration: item.duration
                      });
                      setSelectedId(item.id);
                    }}
                  >         
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteMovie(item.id)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </>
      )}   
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#BAC095', padding: 20 },
  title: {fontSize: 40, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#3D4127'},
  headerRow: { flexDirection: 'row', borderTopWidth: 2 },
  headingForm: {  color: '#3D4127', fontSize: 25, fontWeight: 'bold', padding: 10, textAlign: 'center', width: '50%',backgroundColor: '#d4de95'},
  headingTemp: {  color: '#3D4127', fontSize: 25, fontWeight: 'bold', padding: 10, textAlign: 'center', width: '50%', backgroundColor: '#d4de95'},
  formsRow: { flexDirection: 'row', marginTop: 20, marginBottom: 5, justifyContent: 'space-between' },
  addForm: { marginBottom: 20, width: '35%'},
  inputHeading: { fontSize: 20, color: '#3D4127'},
  buttonsCol: { width: '15%', marginTop: 27},
  tempCol: { width: '48%', marginTop: 27},
  tempText: {fontSize: 15, color: '#3D4127', fontWeight: 'bold'},
  input: { height: 40, backgroundColor: 'white', borderColor: '#ccc', borderWidth: 1, marginBottom: 10, paddingLeft: 10, borderRadius: 5},
  row: { flexDirection: 'row', marginBottom: 5, justifyContent: 'center', alignItems: 'center'},
  idInput: { height: 40, backgroundColor: 'white', borderColor: '#ccc', borderWidth: 1, marginBottom: 10, paddingLeft: 10, borderRadius: 5},
  button: { height: 40, backgroundColor: '#636B2F', padding: 10, borderRadius: 5, alignItems: 'center', marginBottom: 10 },
  deleteAllButton: { height: 40, backgroundColor: '#ac1313', padding: 10, borderRadius: 5, alignItems: 'center', marginBottom: 10},
  showDetailsButton: { backgroundColor: '#636B2F', padding: 10, borderRadius: 5, alignItems: 'center', marginBottom: 10, marginLeft: 5},
  buttonText: { color: '#fff', fontWeight: 'bold' },
  heading: { fontSize: 20, fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
  tempMovieItem: { borderBottomWidth:1, marginTop: 5 },
  currentMovieItem: { flexDirection: 'row', backgroundColor: '#d4de95', marginBottom: 5, borderRadius: 5 },
  movieText: { color: '#1d5a0e', fontSize: 15, fontWeight: 'bold', padding: 5},
  editDeleteButtons: { flexDirection: 'row', marginLeft: 'auto' },
  editButton: { backgroundColor: '#636B2F', padding: 5, borderRadius: 5, width: 55, marginRight: 5 },
  editText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  deleteBtn: { backgroundColor: '#ac1313', padding: 5, borderRadius: 5, width: 55 },
  deleteText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  selectedMovie: { color: '#1d5a0e', fontSize: 20, fontWeight: 'bold', textAlign: 'center', backgroundColor: '#d4de95', padding: 5},
  headingCurrent: { color: '#3D4127', fontSize: 25, fontWeight: 'bold', textAlign: 'center', borderTopWidth: 2, marginVertical: 10, padding: 10, backgroundColor: '#d4de95'},
  
});
