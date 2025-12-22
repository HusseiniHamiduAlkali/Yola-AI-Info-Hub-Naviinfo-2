// Replace with your actual TomTom API Key
//const TOMTOM_KEY = 'YOUR_TOMTOM_API_KEY';



// Function to initialize NaviInfo section
window.initNaviInfo = () => {
    const naviSection = document.getElementById('naviinfo-content');
    if (!naviSection) return;
    
    // Create section content if it doesn't exist
    if (!naviSection.querySelector('.section-content')) {
        naviSection.innerHTML = `
            <div class="section-content">
                <h1>Navigation Information</h1>
                <p>Get directions, distances, and transportation information for Yola, Adamawa State.</p>
                
                <div id="naviinfo-chat-container" class="chat-container">
                    <div id="naviinfo-chat-messages" class="chat-messages"></div>
                    <div id="naviinfo-chat-preview"></div>
                    <div class="chat-input-area">
                        <input type="text" id="naviinfo-chat-input" placeholder="Ask for directions, locations, or transport info...">
                        
                    <div class="route-info"></div>
                </div>
            </div>
        `;
        
          // Load Maps API
      const mapDiv = document.querySelector('#map');
      if (mapDiv) {
        mapDiv.innerHTML = '<div style="text-align:center;padding:2em;color:#666;">Loading map...</div>';
      }
      
      // Load the Maps API script if not already present
      if (!document.getElementById('google-maps-api')) {
        const script = document.createElement('script');
        script.id = 'google-maps-api';
        script.src = 'https://maps.googleapis.com/maps/api/js?libraries=geometry,places&callback=initMap';
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          console.log('Failed to load Google Maps API, trying keyless version...');
          // Fallback to keyless version
          const keylessScript = document.createElement('script');
          keylessScript.src = 'https://cdn.jsdelivr.net/gh/somanchiu/Keyless-Google-Maps-API@v7.0/mapsJavaScriptAPI.js';
          keylessScript.id = 'keyless-maps-api';
          keylessScript.async = true;
          keylessScript.onload = () => {
            if (window.google && window.google.maps) {
              window.initMap();
            }
          };
          document.head.appendChild(keylessScript);
        };
        document.head.appendChild(script);
      } else if (window.google && window.google.maps) {
        // If API is already loaded, initialize the map
        window.initMap();
      }
    }
};

// Gemini model preference
window.useGemini25 = window.useGemini25 || false;

// Register the section initialization
if (typeof window.registerSectionInit === 'function' && typeof window.initNaviInfo === 'function') {
    window.registerSectionInit('naviinfo', window.initNaviInfo);
} else {
    // If registration function isn't available yet, wait for it
    window.addEventListener('load', () => {
        if (typeof window.registerSectionInit === 'function' && typeof window.initNaviInfo === 'function') {
            window.registerSectionInit('naviinfo', window.initNaviInfo);
        }
    });
}

window.toggleGeminiModel = function(section, useGemini25) {
    window.useGemini25 = useGemini25;
    const label = document.querySelector('.model-label');
    if (label) {
        label.textContent = useGemini25 ? 'Using Gemini 2.5 Flash' : 'Using Gemini 1.5 Flash';
    }
    // Store preference
    localStorage.setItem('gemini_model_preference', useGemini25 ? '2.5' : '1.5');
};

// Initialize model preference from storage
if (typeof window.useGemini25 === 'undefined') {
    const storedPreference = localStorage.getItem('gemini_model_preference');
    window.useGemini25 = storedPreference === '2.5';
}

// Global text-to-speech variables and functions
window.currentSpeech = window.currentSpeech || null;

window.stopSpeaking = window.stopSpeaking || function() {
  if (window.currentSpeech) {
    speechSynthesis.cancel();
    window.currentSpeech = null;
  }
};

window.speakText = window.speakText || function(text) {
  window.stopSpeaking();
  
  // Remove HTML tags and convert breaks to spaces
  const cleanText = text.replace(/<[^>]*>/g, '').replace(/<br>/g, ' ');
  
  const utterance = new SpeechSynthesisUtterance(cleanText);
  
  // Set preferred voice (try to use a clear English voice if available)
  const voices = speechSynthesis.getVoices();
  const preferredVoice = voices.find(voice => 
    voice.name.includes('Google') || voice.name.includes('Microsoft') || 
    voice.name.includes('English')
  );
  if (preferredVoice) utterance.voice = preferredVoice;
  
  // Adjust speech parameters for better clarity
  utterance.rate = 1.0;  // Normal speed
  utterance.pitch = 1.0; // Normal pitch
  utterance.volume = 1.0; // Full volume
  
  window.currentSpeech = utterance;
  
  // Visual feedback while speaking
  const speakButton = document.querySelector('.read-aloud-btn');
  if (speakButton) {
    speakButton.style.backgroundColor = '#e2e8f0';
    speakButton.style.transform = 'scale(1.1)';
  }
  
  utterance.onend = () => {
    window.currentSpeech = null;
    if (speakButton) {
      speakButton.style.backgroundColor = '';
      speakButton.style.transform = '';
    }
  };
  
  speechSynthesis.speak(utterance);
};

// Edit this prompt to instruct the AI on how to answer user messages for NaviInfo
window.NAVI_AI_PROMPT = window.NAVI_AI_PROMPT || `You are an AI navigation assistant for Yola, Adamawa State, Nigeria.
Help users with navigation, directions, and transportation in Yola.

Key Capabilities:
1. You can show locations on the map using the showLocation() function
2. You can draw routes between points using the drawRoute() function
3. You can calculate distances using the calculateDistance() function
4. You can display travel time estimates using the estimateTravelTime() function

When users ask for:
- Locations: Use showLocation() to display it on the map
- Directions: Use drawRoute() to show the path
- Distances: Use calculateDistance() to compute and share the distance
- Travel time: Use estimateTravelTime() to provide estimates

Sample responses:
- For locations: "Let me show you that on the map" followed by showLocation()
- For directions: "I'll draw the route for you" followed by drawRoute()
- For distances: "The distance is [result from calculateDistance()]"
- For travel times: "Estimated travel time is [result from estimateTravelTime()]"

If information is not available, say: "Sorry, I do not have that specific information in my local database. Please contact a local transport authority for further help."

For non-navigation queries about health, education, community, environment, jobs, or agriculture, refer users to MediInfo, EduInfo, CommunityInfo, EcoInfo, JobsConnect, or AgroInfo respectively.`;

// Initialize Google Maps instance
window.initMap = function() {
    console.log('Initializing map...');
    const mapDiv = document.getElementById('navi-map');
    if (!mapDiv) {
        console.error('Map container not found');
        return;
    }

    try {
        // Show loading state
        mapDiv.innerHTML = '<div style="text-align:center;padding:2em;color:#666;">Initializing map...</div>';

        // Wait for Maps API to be ready
        if (!window.google || !window.google.maps) {
            setTimeout(window.initMap, 1000);
            return;
        }

        // Clear loading message
        mapDiv.innerHTML = '';

        // Create the map centered on Yola
        window.map = new google.maps.Map(mapDiv, {
            center: { lat: 9.2182, lng: 12.4818 },
            zoom: 13,
            mapTypeId: 'hybrid',
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.TOP_RIGHT
            },
            fullscreenControl: true,
            streetViewControl: true,
            zoomControl: true,
            gestureHandling: 'cooperative',
            styles: [
                {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'on' }]
                },
                {
                    featureType: 'transit',
                    elementType: 'labels',
                    stylers: [{ visibility: 'on' }]
                }
            ]
        });

        // Initialize directions and markers
        window.markers = [];
        
        if (typeof window.initMapDirections === 'function') {
            window.initMapDirections();
        } else {
            console.error('MapDirections not loaded');
        }
        
        console.log('Map initialized successfully');
    } catch (error) {
        console.error('Error initializing map:', error);
    }
};




/**
* Updated Draw Route to use TomTom points on Google Map
*/
window.drawRoute = async function(origin, destination) {
    if (!window.map) return false;
   
    try {
        const routeData = await window.getRouteData(origin, destination);
       
        // Convert TomTom points to Google Maps LatLng
        const path = routeData.points.map(p => ({ lat: p.latitude, lng: p.longitude }));

        // Remove old route if exists
        if (window.currentPath) window.currentPath.setMap(null);

        // Draw the new path on the existing Google Map
        window.currentPath = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: '#3182ce',
            strokeOpacity: 0.8,
            strokeWeight: 5
        });

        window.currentPath.setMap(window.map);

        // Auto-zoom map to fit the route
        const bounds = new google.maps.LatLngBounds();
        path.forEach(p => bounds.extend(p));
        window.map.fitBounds(bounds);

        return routeData; // Return data so AI can display it
    } catch (e) {
        console.error("Failed to draw route:", e);
        return false;
    }
};





// Function to show location on map
window.showLocation = async function(locationName) {
    if (!window.map) return;
    
    // Add "Yola" to the search if not present
    if (!locationName.toLowerCase().includes('yola')) {
        locationName += ' Yola, Nigeria';
    }

    try {
        // Use OpenStreetMap Nominatim for geocoding
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`);
        const data = await response.json();

        if (data && data[0]) {
            // Clear previous markers
            window.markers.forEach(marker => window.map.removeLayer(marker));
            window.markers = [];

            // Add new marker
            const marker = L.marker([data[0].lat, data[0].lon], {
                title: locationName
            }).addTo(window.map);
            window.markers.push(marker);

            // Center map on location
            window.map.setView([data[0].lat, data[0].lon], 15);
            
            // Show the map section
            const mapSection = document.getElementById('map-section');
            if (mapSection) {
                mapSection.style.display = 'block';
                mapSection.scrollIntoView({ behavior: 'smooth' });
            }

            return true;
        }
        return false;
    } catch (error) {
        console.error('Geocoding failed:', error);
        return false;
    }
};

// Function to draw route between two points using Google Maps
// This function has been moved to mapDirections.js for better organization and reliability



// Update the global distance function
window.calculateDistance = async function(origin, destination) {
    const data = await window.getRouteData(origin, destination);
    return data.distance;
};




// Update the global time function
window.estimateTravelTime = async function(origin, destination) {
    const data = await window.getRouteData(origin, destination);
    return data.time;
};

/*
// Function to estimate travel time
window.estimateTravelTime = async function(origin, destination) {
    if (!window.map) {
        throw new Error('Map not initialized');
    }

    try {
        // Add "Yola" to searches if not present
        if (!origin.toLowerCase().includes('yola')) origin += ' Yola, Nigeria';
        if (!destination.toLowerCase().includes('yola')) destination += ' Yola, Nigeria';

        // Geocode both points
        const [originData, destData] = await Promise.all([
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(origin)}`).then(r => r.json()),
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}`).then(r => r.json())
        ]);

        if (originData[0] && destData[0]) {
            const route = await fetch(`https://router.project-osrm.org/route/v1/driving/${originData[0].lon},${originData[0].lat};${destData[0].lon},${destData[0].lat}?overview=false`).then(r => r.json());
            
            if (route.routes && route.routes[0]) {
                const minutes = Math.round(route.routes[0].duration / 60);
                if (minutes < 60) {
                    return `${minutes} minutes`;
                } else {
                    const hours = Math.floor(minutes / 60);
                    const remainingMinutes = minutes % 60;
                    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
                }
            }
        }
        throw new Error('Could not estimate travel time');
    } catch (error) {
        console.error('Travel time estimation failed:', error);
        throw error;
    }
};
*/

window.naviAbortController = window.naviAbortController || null;

// Robust navbar loader
function ensureNavbarLoaded(cb) {
  if (typeof window.renderNavbar === 'function') {
    window.renderNavbar();
    if (cb) cb();
  } else {
    if (!document.getElementById('navbar-js')) {
      const script = document.createElement('script');
      script.src = 'components/navbar.js';
      script.id = 'navbar-js';
      script.onload = function() {
        if (typeof window.renderNavbar === 'function') window.renderNavbar();
        if (cb) cb();
      };
      document.body.appendChild(script);
    } else {
      let tries = 0;
      (function waitForNavbar() {
        if (typeof window.renderNavbar === 'function') {
          window.renderNavbar();
          if (cb) cb();
        } else if (tries < 30) {
          tries++;
          setTimeout(waitForNavbar, 100);
        }
      })();
    }
  }
}

window.renderSection = function() {
  ensureNavbarLoaded();
  if (!document.getElementById('global-css')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'styles/global.css';
    link.id = 'global-css';
    document.head.appendChild(link);
  }
  document.getElementById('main-content').innerHTML = `
    <section class="info-section">
      <h2>NaviInfo - Navigation Help</h2>
      <p>Ask for directions, locations, or transportation information in Yola.</p>
      <div class="chat-container">
        <div class="chat-header">
          <span>NaviInfo AI Chat</span>
          <div class="model-switch">
            <label class="switch">
              <input type="checkbox" id="model-toggle" onchange="window.toggleGeminiModel('navi', this.checked)">
              <span class="slider round"></span>
            </label>
            <span class="model-label">Using Gemini 1.5 Flash</span>
          </div>
        </div>
        <div class="chat-messages" id="navi-chat-messages"></div>
        <form class="chat-input-area" onsubmit="event.preventDefault(); window.sendNaviMessage();">
          <div id="navi-chat-preview" class="chat-preview"></div>
          <input type="text" id="navi-chat-input" placeholder="Ask about navigation..." required />
          <div class="send-button-group">
            <button type="submit" class="send-button">Send</button>
          </div>
        </form>
        <div class="input-options">
          <button type="button" onclick="window.captureImage('navi')" title="Capture Image"><span>📷</span></button>
          <button type="button" onclick="window.recordAudio('navi')" title="Record Audio"><span>🎤</span></button>
          <label class="file-upload-btn" title="Upload File">
            <span>📁</span>
            <input type="file" style="display:none" onchange="window.uploadFile(event, 'navi')" />
          </label>
        </div>
        <div class="faq-list">
        <h3>NaviInfo FAQs</h3>
        <ul>
          <li><a class="faq-link" onclick="window.sendNaviMessage('How do I get to the Yola International Airport?')">How do I get to the Yola International Airport?</a></li>
          <li><a class="faq-link" onclick="window.sendNaviMessage('What are the public transportation options?')">What are the public transportation options?</a></li>
          <li><a class="faq-link" onclick="window.sendNaviMessage('Find directions to the nearest police station.')">Find directions to the nearest police station.</a></li>
          <li><a class="faq-link" onclick="window.sendNaviMessage('Is there a reliable taxi service?')">Is there a reliable taxi service?</a></li>
          <li><a class="faq-link" onclick="window.sendNaviMessage('Where is the main market in Yola?')">Where is the main market in Yola?</a></li>
          <li><a class="faq-link" onclick="window.sendNaviMessage('Traffic updates in Yola')">Traffic updates in Yola</a></li>
        </ul>
      </div>
      </div>
      
      <div class="section-extra">
        <h2>Yola Map</h2>
        <div id="navi-map" class="navi-map-styled"></div>
      </div>

      <div class="section2">
        <h2></h2>
        
                      <a href="details/restaurant.html">Learn more →</a>
            </div>
             
            <div class="              <p>Major mosque serving the university community with regular prayer services.</p>
              <a href="                <img src="Data/Images/zenithgate.jpg" alt="Zenith Bank">
              </div>
              <h3>            <p>Modern fitness center offering gym equipment, classes and spa services.</p>
            <a href="details/ribadu-square.html">Learn more →</a>
          </div>

          <div class="              <div class="img-placeholder">
                <img src="Data/Images/welcometoyola.jpeg" alt="Welcome to Yola Gate">
              </div>
              <h3>Yola main entrance gate</h3>
              <p>Iconic welcome arch marking the main entrance to Yola city.</p>
              <a href="details/roundabout.html">Learn more →</a>
            </div>
            
            <div class="section4">
              <div class="img-placeholder">
                <img src="Data/Images/jambutu.jpg" alt="Jambutu Flyover">
              </div>
              <h3>Jambutu Flyover, Jimeta Yola.</h3>
              <p>Elevated roadway connecting Jambutu area with central Jimeta.</p>
              <a href="details/roundabout.html">Learn more →</a>
            </div>
            
            <div class="section4">
              <div class="img-placeholder">
                <img src="Data/Images/underpass.jpg" alt="Fire Service Roundabout Underpass Construction">
              </div>
              <h3>Ongoing Construction of Underpass at Fire Service Roundabout, Jimeta Yola.</h3>
              <p>Infrastructure development project to improve traffic flow at busy intersection.</p>
              <a href="details/roundabout.html">Learn more →</a>
            </div>

            <div class="section4">
              <div class="img-placeholder">
                <img src="Data/Images/maishanu.jpg" alt="Maishanu Roundabout">
              </div>
              <h3>Roundabout Maishanu Jimeta, Yola.</h3>
              <p>Major traffic circle connecting multiple main roads in Jimeta area.</p>
              <a href="details/roundabout.html">Learn more →</a>
            </div>

          </div>
        </div>
        

        </div>
      </div>
    </section>
  `;
  // Load keyless Google Maps script if not already loaded
  let mapLoaded = false;
  const mapDiv = document.getElementById('navi-map');
  mapDiv.innerHTML = '<div style="color:#aaa;text-align:center;padding:2em 0;">Loading map...</div>';
  function tryInitMap(attempts = 0) {
    if (window.google && window.google.maps) {
      mapLoaded = true;
      mapDiv.innerHTML = '';
      window.initNaviMapInstance();
    } else if (attempts < 30) {
      setTimeout(() => tryInitMap(attempts + 1), 200);
    } else {
      // Show error if map fails to load
      if (mapDiv && !mapLoaded) {
        mapDiv.innerHTML = '<div style="color:#e53e3e;text-align:center;padding:2em 0;">Map could not be loaded. Please check your internet connection or try again later.</div>';
      }
    }
  }
  if (!window.google || !window.google.maps) {
    if (!document.getElementById('keyless-gmaps')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/gh/somanchiu/Keyless-Google-Maps-API@v7.0/mapsJavaScriptAPI.js';
      script.async = true;
      script.id = 'keyless-gmaps';
      document.body.appendChild(script);
    }
    tryInitMap();
  } else {
    mapDiv.innerHTML = '';
    window.initNaviMapInstance();
  }
};

// Google Maps instance and directions logic
window.initNaviMapInstance = function() {
  const yola = { lat: 9.2035, lng: 12.4954 };
  const mapDiv = document.getElementById('navi-map');
  window.naviMap = new google.maps.Map(mapDiv, {
    center: yola,
    zoom: 13,
    mapTypeId: 'hybrid' // hybrid = satellite + labels
  });
  window.naviMarker = new google.maps.Marker({ position: yola, map: window.naviMap, title: 'Yola' });
  window.naviDirectionsRenderer = new google.maps.DirectionsRenderer({ map: window.naviMap });
  window.naviDirectionsService = new google.maps.DirectionsService();
};







/**
* Formats seconds into a readable string: X hrs, Y min, Z sec
*/
function formatDuration(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    let parts = [];
    if (hrs > 0) parts.push(`${hrs} hrs`);
    if (mins > 0) parts.push(`${mins} min`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs} sec`);
   
    return parts.join(', ');
}


/**
* Uses TomTom API to calculate route data
* This replaces the OSRM calls for better accuracy.
*/

// Find this function
window.getRouteData = async function(origin, destination) {
    try {
        const geocode = async (query) => {
            const q = query.toLowerCase().includes('yola') ? query : `${query}, Yola, Nigeria`;
            // CHANGE: Use window.TOMTOM_API_KEY here
            const url = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(q)}.json?key=${window.TOMTOM_API_KEY}`;
            const res = await fetch(url).then(r => r.json());
            if (!res.results || res.results.length === 0) throw new Error(`Location not found: ${query}`);
            return res.results[0].position; 
        };

        const startPos = await geocode(origin);
        const endPos = await geocode(destination);

        // CHANGE: Use window.TOMTOM_API_KEY here
        const routeUrl = `https://api.tomtom.com/routing/1/calculateRoute/${startPos.lat},${startPos.lon}:${endPos.lat},${endPos.lon}/json?key=${window.TOMTOM_API_KEY}&travelMode=car`;
        const routeRes = await fetch(routeUrl).then(r => r.json());
       
        // ... rest of the function remains the same ...
                                                                                                     
                                                                                                     
                                                                                                     
        if (!routeRes.routes || routeRes.routes.length === 0) throw new Error("No route found");

        const summary = routeRes.routes[0].summary;
        const distanceKm = (summary.lengthInMeters / 1000).toFixed(2);
        const durationSec = summary.travelTimeInSeconds;

        return {
            distance: `${distanceKm} km`,
            time: formatDuration(durationSec),
            points: routeRes.routes[0].legs[0].points // Can be used to draw on Google Maps
        };
    } catch (error) {
        console.error("TomTom Routing Error:", error);
        throw error;
    }
};








async function getGeminiAnswer(localData, msg, apiKey, imageData = null) {
  try {
    // 1. Use the correct model ID for Gemini 2.5 Flash
    const modelVersion = 'gemini-2.5-flash';
   
    // 2. Point directly to Google's API URL
    const serverUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:generateContent?key=${apiKey}`;

    const contents = {
      parts: []
    };
   
    // Add prompt and context
    const promptGuide = localStorage.getItem('navi_ai_prompt') || (window.NAVI_AI_PROMPT || "You are a helpful assistant.");
    const fullText = `${promptGuide}\n\n--- LOCAL DATA START ---\n${localData}\n--- LOCAL DATA END ---\n\nUser question: ${msg}`;
   
    contents.parts.push({ text: fullText });

    // Handle Image if present
    if (imageData) {
       // Remove the "data:image/jpeg;base64," prefix if present
       const base64Data = imageData.split(',')[1];
       contents.parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      });
    }

    const body = JSON.stringify({ contents: [contents] });

    // 3. Fetch directly from Google
    let res = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body,
      signal: window.naviAbortController?.signal
    });

    if (!res.ok) {
       // This will log the specific error (e.g., 400 Bad Request or 403 Forbidden)
       const errorData = await res.json();
       console.error("Gemini API Error:", errorData);
       throw new Error(`API Error: ${res.status}`);
    }

    let data = await res.json();
   
    // Extract text from response
    return (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0].text)
      ? data.candidates[0].content.parts[0].text
      : "Sorry, I couldn't get a response from the AI.";

  } catch (err) {
    console.error("FULL ERROR DETAILS:", err);
    // If it's a real network error, this message is appropriate.
    // If it's an API key error, the console.error above will show it.
    return "Sorry, I could not access local information or the AI at this time. Pls check your internet connection!";
  }
}



// Common function to format AI responses
function formatAIResponse(text) {
  let formatted = text
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '<b>$1</b>') // Bold
    .replace(/\n/g, '<br>'); // Line breaks
  
  return `
    <div class="ai-response">
      ${formatted}
      <button onclick="window.speakText(this.parentElement.textContent)" class="read-aloud-btn" title="Listen to Response">
        🔊
      </button>
      <style>
        .read-aloud-btn {
          background: transparent;
          border: 1px solid #cbd5e0;
          border-radius: 6px;
          padding: 4px 8px;
          margin-top: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.9em;
        }
        .read-aloud-btn:hover {
          background: #e2e8f0;
          transform: translateY(-1px);
        }
      </style>
    </div>
  `;
}

// Common image capture function
window.captureImage = function(section) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = `
    <div class="camera-modal">
      <video id="camera-feed" autoplay playsinline></video>
      <button id="snap-btn">Capture Photo</button>
      <button id="close-camera">Close</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const video = document.getElementById('camera-feed');
  const snapBtn = document.getElementById('snap-btn');
  const closeBtn = document.getElementById('close-camera');
  let stream;

  navigator.mediaDevices.getUserMedia({ video: true })
    .then(s => {
      stream = s;
      video.srcObject = stream;
    })
    .catch(err => {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please ensure you have a camera and have granted permission.");
      overlay.remove();
    });

  snapBtn.onclick = () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataURL = canvas.toDataURL('image/png');
    document.getElementById(section + '-chat-preview').innerHTML = `<img src='${imageDataURL}' style='max-width:120px;max-height:80px;border-radius:8px;margin:4px 0;' alt='Captured Image' />`;
    overlay.remove();
    if (stream) stream.getTracks().forEach(t => t.stop());
  };

  closeBtn.onclick = () => {
    overlay.remove();
    if (stream) stream.getTracks().forEach(t => t.stop());
  };
};

// Common audio recording function
window.recordAudio = function(section) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = `
    <div class="audio-modal">
      <p>Recording...</p>
      <button id="stop-recording">Stop Recording</button>
      <button id="close-audio">Close</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const stopBtn = document.getElementById('stop-recording');
  const closeBtn = document.getElementById('close-audio');
  let mediaRecorder;
  let audioChunks = [];
  let stream;

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(s => {
      stream = s;
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = e => {
        audioChunks.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioURL = URL.createObjectURL(audioBlob);
        document.getElementById(section + '-chat-preview').innerHTML = `<audio src='${audioURL}' controls style='max-width:120px;vertical-align:middle;margin:4px 0;'></audio>`;
        overlay.remove();
        if (stream) stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start();
    })
    .catch(err => {
      console.error("Error accessing audio:", err);
      alert("Could not access microphone. Please ensure you have a microphone and have granted permission.");
      overlay.remove();
    });

  stopBtn.onclick = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    if (stream) stream.getTracks().forEach(t => t.stop());
    overlay.remove();
  };
  closeBtn.onclick = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    if (stream) stream.getTracks().forEach(t => t.stop());
    overlay.remove();
  };
};

// Common file upload function
window.uploadFile = function(e, section) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    const preview = document.getElementById(section + '-chat-preview');
    let html = '';
    if (file.type.startsWith('image/')) {
      html = `<img src='${ev.target.result}' style='max-width:120px;max-height:80px;border-radius:8px;margin:4px 0;' alt='Uploaded Image' />`;
    } else if (file.type.startsWith('audio/')) {
      html = `<audio src='${ev.target.result}' controls style='max-width:120px;vertical-align:middle;margin:4px 0;'></audio>`;
    } else if (file.type.startsWith('video/')) {
      html = `<video src='${ev.target.result}' controls style='max-width:120px;max-height:80px;border-radius:8px;margin:4px 0;'></video>`;
    } else if (file.type === 'application/pdf') {
      html = `<iframe src='${ev.target.result}' style='width:120px;height:80px;border-radius:8px;margin:4px 0;'></iframe><p style='font-size:10px;margin:0;'>${file.name}</p>`;
    } else {
      html = `<p style='font-size:12px;margin:4px 0;'>${file.name}</p>`;
    }
    preview.innerHTML = html;
  };
  reader.readAsDataURL(file);
};

window.stopNaviResponse = function() {
  if (window.naviAbortController) {
    window.naviAbortController.abort();
    window.naviAbortController = null;
  }
  const sendBtn = document.querySelector('.send-button');
  if (sendBtn) {
    sendBtn.classList.remove('sending');
    sendBtn.textContent = 'Send';
    sendBtn.style.backgroundColor = '';
  }
};




window.sendMessage = async function(section) {
    const input = document.getElementById(`${section}-chat-input`);
    const chat = document.getElementById(`${section}-chat-messages`);
    const userMsg = input.value.trim();
    if (!userMsg) return;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${window.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ contents: [{ parts: [{ text: userMsg }] }] })
        });
        const data = await response.json();
        chat.innerHTML += `<p><b>AI:</b> ${data.candidates[0].content.parts[0].text}</p>`;
    } catch (e) {
        alert("AI Error: Check if your GitHub Secret is named exactly GEMINI_API_KEY");
    }
};




window.sendNaviMessage = async function(faqText = '') {
  const input = document.getElementById('navi-chat-input');
  const chat = document.getElementById('navi-chat-messages');
  const preview = document.getElementById('navi-chat-preview');
  const sendBtn = document.querySelector('.send-button');
  const stopBtn = document.querySelector('.stop-button');
  
  // Extract image data if present in preview
  let imageData = null;
  if (preview) {
    const previewImg = preview.querySelector('img');
    if (previewImg) {
      imageData = previewImg.src;
      msg = (msg || '') + "\nPlease analyze this image and provide relevant navigation information, identify landmarks, or suggest similar places to visit.";
    }
  }
  let msg = faqText || input.value.trim();
  let attach = preview.innerHTML;
  if (!msg && !attach) return;

  if (window.naviAbortController) {
    window.naviAbortController.abort();
  }
  window.naviAbortController = new AbortController();

  if (sendBtn) {
    sendBtn.classList.add('sending');
    sendBtn.textContent = 'Stop';
    sendBtn.style.backgroundColor = '#ff4444';

    // Add click handler to stop response
    const stopHandler = () => {
      const stopHandler = (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        if (window.naviAbortController) {
          window.naviAbortController.abort();
          window.naviAbortController = null;
        }
        sendBtn.removeEventListener('click', stopHandler);
        sendBtn.classList.remove('sending');
        sendBtn.textContent = 'Send';
        sendBtn.style.backgroundColor = '';
      };
      sendBtn.addEventListener('click', stopHandler);
  }

  const msgGroup = document.createElement('div');
  msgGroup.className = 'chat-message-group';
  msgGroup.innerHTML = `
    <div class='user-msg'>${msg}${attach ? "<br>" + attach : ""}</div>
    <div class='ai-msg'><span class='ai-msg-text'>Navi AI typing...</span></div>
  `;
  chat.appendChild(msgGroup);
  preview.innerHTML = '';
  if (!faqText) input.value = '';

  // Load existing chat history
  let chatHistory = JSON.parse(localStorage.getItem('navi_chat_history') || '[]');

  let finalAnswer = "";
  let directionsDrawn = false;
  try {
    const localData = await fetch('Data/NaviInfo/naviinfo.txt').then(r => r.text());
    
    // Include chat history in the context
    const historyContext = chatHistory.length > 0 
        ? "\n\nRecent conversation history:\n" + chatHistory.map(h => `User: ${h.user}\nAI: ${h.ai}`).join('\n\n')
        : "";

      
    // Ensure the 3rd argument uses the global variable from app.js
finalAnswer = await getGeminiAnswer(
    NAVI_AI_PROMPT + "\n\n" + localData + historyContext, 
    msg, 
    window.GEMINI_API_KEY, // This refers to the placeholder in app.js
    imageData
);

      
    // Store in chat history (keep last 5 messages)
    chatHistory.push({ user: msg, ai: finalAnswer });
    if (chatHistory.length > 5) chatHistory = chatHistory.slice(-5);
    localStorage.setItem('navi_chat_history', JSON.stringify(chatHistory));
    // Try to extract directions from the AI response or user message
    // Example: "Directions from [origin] to [destination]"
    const dirMatch = /(?:directions|route|how\s+to\s+get)\s+from\s+([^\n]+?)\s+to\s+([^\n.]+)[\n.]/i.exec(msg + ' ' + finalAnswer);
    if (dirMatch) {
      const origin = dirMatch[1].trim();
      const destination = dirMatch[2].trim();
      try {
        directionsDrawn = await window.drawRoute(origin, destination);
      } catch (e) {
        console.error("Failed to draw route:", e);
      }
    }
  } catch (e) {
      if (e.name === 'AbortError' || e.message === 'AbortError') {
        finalAnswer = "USER ABORTED REQUEST";
      } else {
        console.error("Error fetching local data or Gemini API call:", e);
        finalAnswer = "Sorry, I could not access local information or the AI at this time. Pls check your internet connection!";
      }
  }

  msgGroup.querySelector('.ai-msg-text').innerHTML = formatAIResponse(finalAnswer) + (directionsDrawn ? '<br><span style="color:#3182ce">Directions drawn on map.</span>' : '');
  chat.scrollTop = chat.scrollHeight;

  if (sendBtn) {
    sendBtn.disabled = false;
    sendBtn.classList.remove('sending');
    sendBtn.querySelector('.send-text').textContent = 'Send';
  }
  if (stopBtn) stopBtn.style.display = 'none';
  window.naviAbortController = null;
}};




