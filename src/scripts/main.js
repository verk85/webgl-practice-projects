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
    void main() {
      gl_FragColor = vec4(1.0, 0.5, 1.0, 1.0); // color (RGBA)
    }
  `;
  // Compile the vertex and fragment shaders
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  // Link the shaders into a program
  const program = createProgram(gl, vertexShader, fragmentShader);
  gl.useProgram(program); // Use the program

  // Define the triangle vertices
  const triangleVertices = new Float32Array([
    0.0,  0.5,  // Top vertex
   -0.5, -0.5,  // Bottom-left vertex
    0.5, -0.5   // Bottom-right vertex
  ]);

  // Define the square vertices
  const squareVertices = new Float32Array([
    0.5,  0.5,  // Top vertex
   -0.5,  0.5,  // Bottom-left vertex
    0.5, -0.5,  // Bottom-right vertex
   -0.5, -0.5
  ]);

  // Create a buffer to store the vertices
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // Bind the buffer
  gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.STATIC_DRAW); // Upload vertex data

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

  // Set the viewport to match the canvas dimensions
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas and set the background color to black
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Black background
  gl.clear(gl.COLOR_BUFFER_BIT); // Clear the color buffer

  // Draw the triangle
  gl.drawArrays(gl.TRIANGLES, 0, 3); // Draw 3 vertices as a triangle
  // gl.drawArrays(gl.)
}

main();