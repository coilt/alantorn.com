precision mediump float;

    // default mandatory variables
    attribute vec3 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;

    uniform mat4 planeTextureMatrix;

    // custom variables
    varying vec3 vVertexPosition;
    varying vec2 vTextureCoord;
    
    uniform vec2 uMousePosition;
    uniform float uTime;
    uniform float uTransition;

    void main() {
        vec3 vertexPosition = aVertexPosition;
        
        // convert uTransition from [0,1] to [0,1,0]
        float transition = 1.0 - abs((uTransition * 2.0) - 1.0);
        
        //vertexPosition.x *= (1 + transition * 2.25);
        
        // get the distance between our vertex and the mouse position
        float distanceFromMouse = distance(uMousePosition, vec2(vertexPosition.x, vertexPosition.y));

        // calculate our wave effect
        float waveSinusoid = cos(5.0 * (distanceFromMouse - (uTime / 30.0)));

        // attenuate the effect based on mouse distance
        float distanceStrength = (0.4 / (distanceFromMouse + 0.4));

        // calculate our distortion effect
        float distortionEffect = distanceStrength * waveSinusoid * 0.33;

        // apply it to our vertex position
        vertexPosition.z +=  distortionEffect * -transition;
        vertexPosition.x +=  (distortionEffect * transition * (uMousePosition.x - vertexPosition.x));
        vertexPosition.y +=  distortionEffect * transition * (uMousePosition.y - vertexPosition.y);

        gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);

        // varyings
        vVertexPosition = vertexPosition;
        vTextureCoord = (planeTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;
    }