// Function to compile a shader
function createShader(gl, type, source) {
  const shader = gl.createShader(type); // Create the shader
  gl.shaderSource(shader, source); // Attach source code
  gl.compileShader(shader); // Compile the shader
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader)); // Log errors if any
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// Function to create a WebGL program
function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader); // Attach vertex shader
  gl.attachShader(program, fragmentShader); // Attach fragment shader
  gl.linkProgram(program); // Link the program
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program)); // Log errors if any
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function resize(gl, canvas, program){
  // Set the viewport to match the canvas dimensions
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);

  const uResolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  gl.uniform2f(uResolutionLocation, canvas.width, canvas.height);
}

function main(){

  // Get the canvas element and initialize WebGL context
  const canvas = document.getElementById('webgl-canvas');
  const gl = canvas.getContext('webgl');
  if (!gl) {
    console.error('WebGL not supported');
    return;
  } 
  console.log('WebGL initialized!');

  // Vertex Shader Source Code
  const vertexShaderSource = `
    attribute vec2 aPosition; // Vertex position
    void main() {
      gl_Position = vec4(aPosition, 0.0, 1.0); // Transform into clip space
    }
  `;

  // Fragment Shader Source Code
  const fragmentShaderSource = `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_time;

    vec2 nMousePosition(){
      return u_mouse / u_resolution;
    }
    
    vec2 nSt(){
      return gl_FragCoord.xy / u_resolution;
    }

    vec4 red (){
      return vec4(1.0, 0.0, 0.0, 1.0); // Return red color
    }
    vec4 radialGradientSmooth() {
      vec2 center = vec2(0.5);                // Center of the screen
      vec2 distanceFromCenter = nSt() - center; // Vector from center to fragment

      // Calculate the angle in degrees
      float angle = atan(distanceFromCenter.y, distanceFromCenter.x); // Angle in radians
      angle = degrees(angle);                 // Convert to degrees
      angle = mod(angle + 360.0, 360.0);      // Normalize to [0, 360]

      // Map angle to hue (convert to RGB using HSV-to-RGB logic)
      float red = abs(sin(radians(angle)));
      float green = abs(sin(radians(angle - 120.0)));
      float blue = abs(sin(radians(angle - 240.0)));

      // Return the final color
      return vec4(red, green, blue, 1.0);
    }
vec4 linearGradientSmooth() {
    vec2 center = vec2(0.5);                // Center of the screen (normalized coordinates)
    vec2 distanceFromCenter = nSt() - center; // Vector from center to fragment

    // Use the horizontal position normalized to [0, 1]
    float position = nSt().x;

    // Initialize the RGB components
    float red = 0.0;
    float green = 0.0;
    float blue = 0.0;

    // Determine the gradient segment and calculate colors
    if (position >= 0.0 && position < 0.333) {
        red = 1.0 - (position / 0.333); // Red decreases
        green = position / 0.333;      // Green increases
    } else if (position >= 0.333 && position < 0.666) {
        green = 1.0 - ((position - 0.333) / 0.333); // Green decreases
        blue = (position - 0.333) / 0.333;          // Blue increases
    } else if (position >= 0.666 && position <= 1.0) {
        blue = 1.0 - ((position - 0.666) / 0.333); // Blue decreases
        red = (position - 0.666) / 0.333;         // Red increases
    }

    // Return the final color
    return vec4(red, green, blue, 1.0); // RGBA output
}

        
    vec4 radialGradient() {
      vec2 center = vec2(0.5);                // Center of the screen
      vec2 distanceFromCenter = nSt() - center; // Vector from center to fragment

      // Calculate the angle in degrees
      float angle = atan(distanceFromCenter.y, distanceFromCenter.x); // Angle in radians
      angle = degrees(angle);                 // Convert to degrees
      angle = mod(angle + 360.0, 360.0);      // Normalize to [0, 360]

      // Map angles to RGB
      float red = max(0.0, cos(radians(angle - 0.0)));      // Red peaks at 0°
      float green = max(0.0, cos(radians(angle - 120.0)));  // Green peaks at 120°
      float blue = max(0.0, cos(radians(angle - 240.0)));   // Blue peaks at 240°

      // Return the final color
      return vec4(red, green, blue, 1.0);
    }

    vec4 variantColor(){
      float red = abs(sin(u_time));
      float green = nMousePosition().x;
      float blue = nMousePosition().y;
      return vec4(red,green,blue,1.0);
    }
    
    vec4 rainbow() {
      // Normalize the x position
      float x = nSt().x;
      
      // Calculate RGB values based on x (0 to 1)
      float r = 0.5 + 0.5 * sin(x * 6.2831);   // Red (sine wave based on x position)
      float g = 0.5 + 0.5 * sin(x * 6.2831 + 2.0); // Green (offset sine wave)
      float b = 0.5 + 0.5 * sin(x * 6.2831 + 4.0); // Blue (offset sine wave)
      
      return vec4(r, g, b, 1.0); // Return the final color
    }
    void main() {
      gl_FragColor = rainbow(); // color (RGBA)
      // gl_FragColor = vec4(1.0,1.0,1.0,1.0);
    }
  `;
  
  // Compile the vertex and fragment shaders
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  // Link the shaders into a program
  const program = createProgram(gl, vertexShader, fragmentShader);
  gl.useProgram(program); // Use the program

  // Define the triangle vertices
  // const triangleVertices = new Float32Array([
  //   0.0,  0.5,  // Top vertex
  //  -0.5, -0.5,  // Bottom-left vertex
  //   0.5, -0.5   // Bottom-right vertex
  // ]);
    // Define the triangle vertices
    const triangleVertices = new Float32Array([
      0.0,  1.0,  // Top vertex
     -1.0, -1.0,  // Bottom-left vertex
      1.0, -1.0   // Bottom-right vertex
    ]);

  // Define the square vertices (two triangles)
  const squareVertices = new Float32Array([
    -1.0,  1.0,  // Top-left
    0.95,  1.0,  // Top-right
    -1.0, -0.95,  // Bottom-left
    
    -0.95, -1.0,  // Bottom-left
    1.0, 0.95,  // Top-right
    1.0, -1.0   // Bottom-right
  ]);


  // Create a buffer to store the vertices
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // Bind the buffer
  gl.bufferData(gl.ARRAY_BUFFER, squareVertices, gl.STATIC_DRAW); // Upload vertex data

  // Link the vertex data to the 'aPosition' attribute in the vertex shader
  const positionAttributeLocation = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(positionAttributeLocation); // Enable the attribute
  gl.vertexAttribPointer(
    positionAttributeLocation, // Attribute location
    2, // Number of components per vertex (X, Y)
    gl.FLOAT, // Data type
    false, // No normalization
    0, // Stride (no gaps between vertices)
    0 // Offset (start at the beginning)
  );


  resize(gl, canvas, program);
  const uTimeLocation = gl.getUniformLocation(program, 'u_time');
  const uMouseLocation = gl.getUniformLocation(program, 'u_mouse');


  let startTime = performance.now();
  let mouseX = 0, mouseY = 0;

  canvas.addEventListener('mousemove', (event) => { 
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = canvas.height - (event.clientY - rect.top);
  });
  window.addEventListener('resize',()=> resize(gl, canvas, program));
  
  function render() {
    const currentTime = (performance.now() - startTime) / 1000; // Time in seconds
    gl.uniform1f(uTimeLocation, currentTime);
    gl.uniform2f(uMouseLocation, mouseX, mouseY);

    // Clear the canvas
    gl.clearColor(0.0 ,0.0 ,0.0 ,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw the triangle
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
  }
 
  render(); // Start rendering loop
}

main();