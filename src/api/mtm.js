import moment from 'moment';
import axios from 'axios';
import Song from '../entities/Song.js';
import SongRank from '../entities/SongRank.js';
import MediaItem from '../entities/MediaItem.js';
import ChartPosition from '../entities/ChartPosition.js';

const BASE_URL = "http://localhost:8888/api";

export default class MusicAPI {

  constructor() { }

  /**
   * Handles errors in request
   */
  static handleError = (error) => {
    var message = "Unreachable server error";
    if (error.response.data.errors[0] != undefined) {
      message = error.response.data.errors[0].details;
    }

    throw new Error(message);
  };

  /**
   * Get songs in the billboard chart in a given date
   */
  static getChart = (date) => {

	 let query = `SELECT DISTINCT ?position ?name ?id ?name1 
    WHERE {
      ?Chart a schema:MusicPlaylist;
        schema:datePublished "${date}";
        schema:track ?ListItem0.
      ?ListItem0 a schema:ListItem;
        schema:item ?Song;
        schema:position ?position.
      ?Song a schema:MusicRecording;
        schema:name ?name;
        schema:byArtist ?Artist;
        billboard:id ?id.
      ?Artist a schema:MusicGroup;
        schema:name ?name1
    }`;
    let LRA_URL = "http://localhost:9000/api/lra/query?q=" + encodeURIComponent(query);
    

    return axios.get(LRA_URL)
      .then(function (res) {

        let result = res.data.table.rows;
        let chart = [];
        

        result.forEach((chartItem) => {
          chart.push(new ChartPosition(chartItem['?position'], chartItem['?id'], chartItem['?name'], chartItem['?name1']));
        });

        return chart;
      })
      .catch(function (error) {
        MusicAPI.handleError(error);
      });
  };

  /**
   * Get song information given an id
   */
  static getSongInfo = (id) => {
  	
  	 let query = `SELECT DISTINCT ?duration ?url ?name ?artistName ?albumCoverImage ?albumRelease ?albumName 
WHERE {
	?Song a schema:MusicRecording;
		billboard:id "${id}";
		schema:duration ?duration;
		schema:url ?url;
		schema:name ?name;
		schema:byArtist ?artist;
		schema:inAlbum ?album.
	?artist a schema:MusicGroup;
		schema:name ?artistName.
	?album a schema:MusicAlbum;
		schema:image ?albumCoverImage;
		schema:albumRelease ?albumRelease;
		schema:name ?albumName
}`;
    let LRA_URL = "http://localhost:9000/api/lra/query?q=" + encodeURIComponent(query);
    return axios.get(LRA_URL)
      .then(function (response) {

        let result = response.data.table.row;

        let song = new Song(result['?id'], result['?name'], result['?artist'],
                    result['?albumName'], result['?albumRelease'], result['?duration'],
                    result['?url'], result['?image']);

        return song;

      })
      .catch(function (error) {
        MusicAPI.handleError(error);
      });
  }

  /**
   * Get historical ranks of a song given an id
   */
  static getSongRankings = (id) => {
    let requestUrl = BASE_URL + "/songs/" + id + "/ranks";

    return axios.get(requestUrl)
      .then(function (res) {
        let result = res.data.data;
        let rankings = [];

        result.forEach((ranking) => {
          rankings.push(new SongRank(ranking.endDate, ranking.rank));
        });

        return rankings;
      })
      .catch(function (error) {
        MusicAPI.handleError(error);
      });
  }

  /**
   * Get related media of a song given an id.
   */
  static getSongMedia = (id) => {
    let requestUrl = BASE_URL + "/songs/" + id + "/media?n=4";

    return axios.get(requestUrl)
      .then(function (res) {

        let result = res.data.data;
        let media = [];

        result.forEach((mediaObject) => {
          media.push(new MediaItem(mediaObject.url, mediaObject.caption, mediaObject.thumbnail));
        });

        return media;
      })
      .catch(function (error) {
        MusicAPI.handleError(error);
      });
  }
}
