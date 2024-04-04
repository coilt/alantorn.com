const cubicBezier = `
// Helper functions:
float slopeFromT (float t, float A, float B, float C){
  float dtdx = 1.0/(3.0*A*t*t + 2.0*B*t + C); 
  return dtdx;
}

float xFromT (float t, float A, float B, float C, float D){
  float x = A*(t*t*t) + B*(t*t) + C*t + D;
  return x;
}

float yFromT (float t, float E, float F, float G, float H){
  float y = E*(t*t*t) + F*(t*t) + G*t + H;
  return y;
}
float cubicBezier (float x, float a, float b, float c, float d){

  float y0a = 0.00; // initial y
  float x0a = 0.00; // initial x 
  float y1a = b;    // 1st influence y   
  float x1a = a;    // 1st influence x 
  float y2a = d;    // 2nd influence y
  float x2a = c;    // 2nd influence x
  float y3a = 1.00; // final y 
  float x3a = 1.00; // final x 

  float A =   x3a - 3.*x2a + 3.*x1a - x0a;
  float B = 3.*x2a - 6.*x1a + 3.*x0a;
  float C = 3.*x1a - 3.*x0a;   
  float D =   x0a;

  float E =   y3a - 3.*y2a + 3.*y1a - y0a;    
  float F = 3.*y2a - 6.*y1a + 3.*y0a;             
  float G = 3.*y1a - 3.*y0a;             
  float H =   y0a;

  // Solve for t given x (using Newton-Raphelson), then solve for y given t.
  // Assume for the first guess that t = x.
  float currentt = x;
  const int nRefinementIterations = 5;
  for (int i=0; i < nRefinementIterations; i++){
    float currentx = xFromT (currentt, A,B,C,D); 
    float currentslope = slopeFromT (currentt, A,B,C);
    currentt -= (currentx - x)*(currentslope);
    currentt = clamp(currentt, 0.,1.);
  } 

  float y = yFromT (currentt,  E,F,G,H);
  return y;
}
`;
 
// transformations

function ensureFloat(num) {
  let stringed = num.toString()
  const dotIndex = stringed.indexOf('.')
  if (dotIndex === -1) {
    stringed += '.'
  }
  return stringed
}

const transformations = {
  none: () => '',
  flipX: () => {
    return `
    float beizerProgress = cubicBezier(vertexProgress,
      uBeizerControls.x, uBeizerControls.y,
      uBeizerControls.z, uBeizerControls.w);

    float flippedX = -pos.x;
    pos.x = mix(pos.x, flippedX, beizerProgress);
    pos.z += beizerProgress;

    // Flip texture on flipped sections
    float syncDifference = uSyncLatestStart;
    float aspectRatio = (uMeshScale.x / uMeshScale.y);
    float stepFormula = 0.5 - (syncDifference * uSyncLatestStart * uSyncLatestStart) * aspectRatio;

    transformedUV.x = mix(transformedUV.x, 1.0 - transformedUV.x, step(stepFormula, beizerProgress));
  `;
  },
   
  wavy: () => {
    return `
    float limit = 0.5;
      float wavyProgress = min(clamp((vertexProgress) / limit, 0.0, 1.0), clamp((1.0 - vertexProgress) / (1.0 - limit), 0.0, 1.0));

      float dist = length(transformedPos.xy);
      float angle = atan(transformedPos.x, transformedPos.y);

      float nextDist = dist * (uAmplitude * (sin(angle * uFrequency + uSeed) / 20.0 + 0.8) + 1.0);

      vec3 transformedPos2 = transformedPos;
      transformedPos2.x = sin(angle) * nextDist;
      transformedPos2.y = cos(angle) * nextDist;

      transformedPos = mix(transformedPos, transformedPos2, wavyProgress);
    `;
  },

  // simplex: (props) => {
  //   let amplitudeX = ensureFloat(props.amplitudeX || 0.5)
  //   let amplitudeY = ensureFloat(props.amplitudeY || 0.5)
  //   let frequencyX = ensureFloat(props.frequencyX || 1)
  //   let frequencyY = ensureFloat(props.frequencyY || 0.75)
  //   let progressLimit = ensureFloat(props.progressLimit || 0.5)

  //   return `
  //     float simplexProgress = min(clamp((vertexProgress) / ${progressLimit}, 0.0, 1.0), clamp((1.0 - vertexProgress) / (1.0 - ${progressLimit}), 0.0, 1.0));
  //     simplexProgress = smoothstep(0.0, 1.0, simplexProgress);

  //     float noiseX = snoise(vec2(transformedPos.x + uSeed, transformedPos.y + uSeed + simplexProgress * 1.0)) * ${frequencyX};
  //     float noiseY = snoise(vec2(transformedPos.y + uSeed, transformedPos.x + uSeed + simplexProgress * 1.0)) * ${frequencyY};

  //     transformedPos.x += ${amplitudeX} * noiseX * simplexProgress;
  //     transformedPos.y += ${amplitudeY} * noiseY * simplexProgress;
  //   `
  // },


  // wavy: {
  //   uniforms: {
  //     uSeed: { value: 0, type: 'float' },
  //     uAmplitude: { value: 0.5, type: 'float' },
  //     uFrequency: { value: 4, type: 'float' },
  //   },
  //   getTransformation: () => {
  //     return `
  //       float limit = 0.5;
  //       float wavyProgress = min(clamp((vertexProgress) / limit, 0.0, 1.0), clamp((1.0 - vertexProgress) / (1.0 - limit), 0.0, 1.0));

  //       float dist = length(transformedPos.xy);
  //       float angle = atan(transformedPos.x, transformedPos.y);

  //       float nextDist = dist * (uAmplitude * (sin(angle * uFrequency + uSeed) / 2.0 + 0.5) + 1.0);

  //       transformedPos.x = mix(transformedPos.x, sin(angle) * nextDist, wavyProgress);
  //       transformedPos.y = mix(transformedPos.y, cos(angle) * nextDist, wavyProgress);
  //     `;
  //   },
  // },


  circle: (props) => {
    return `
      float limit = 0.5;
      float circleProgress = min(clamp((vertexProgress) / limit, 0.0, 1.0), clamp((1.0 - vertexProgress) / (1.0 - limit), 0.0, 1.0));

      float maxDistance = 0.5;
      float dist = length(transformedPos.xy);

      float nextDist = min(maxDistance, dist);
      float overload = step(maxDistance, dist);
      float angle = atan(transformedPos.x, transformedPos.y);

      transformedPos.x = mix(transformedPos.x, sin(angle) * nextDist, circleProgress);
      transformedPos.y = mix(transformedPos.y, cos(angle) * nextDist, circleProgress);
      transformedPos.z += -0.5 * overload * circleProgress;
    `
  },
}

const activations = {
  corners: `
    float getActivation(vec2 uv) {
      float top = (1.0 - uv.y);
      float right = uv.x;
      float bottom = uv.y;
      float left = 1.0 - uv.x;

      return top * 0.333333 + (right * 0.333333 + (right * bottom) * 0.666666);
    }
  `,

  topLeft: `
    float getActivation(vec2 uv) {
      return (+uv.x - uv.y + 1.0) / 2.0;
    }
  `,

  sides: `
    float getActivation(vec2 uv) {
      return min(uv.x, 1.0 - uv.x) * 2.0;
    }
  `,

  left: `
    float getActivation(vec2 uv) {
      return uv.x;
    }
  `,

  top: `
    float getActivation(vec2 uv) {
      return 1.0 - uv.y;
    }
  `,

  bottom: `
    float getActivation(vec2 uv) {
      return uv.y;
    }
  `,

  bottomStep: `
    float getActivation(vec2 uv) {
      return uv.y;
    }
  `,

  sinX: `
    float getActivation(vec2 uv) {
      return sin(uv.x * 3.14);
    }
  `,

  center: `
    float getActivation(vec2 uv) {
      float maxDistance = distance(vec2(0.0), vec2(0.5));
      float dist = distance(vec2(0.0), uv - 0.5);
      return smoothstep(0.0, maxDistance, dist);
    }
  `,

  mouse: `
    float getActivation(vec2 uv) {
      float maxDistance = distance(uMouse, 1.0 - floor(uMouse + 0.5));
      float dist = smoothstep(0.0, maxDistance, distance(uMouse, uv));
      return dist;
    }
  `,

  closestCorner: `
    float getActivation(vec2 uv) {
      float y = mod(uClosestCorner, 2.0) * 2.0 - 1.0;
      float x = (floor(uClosestCorner / 2.0) * 2.0 - 1.0) * -1.0;

      float xAct = abs(min(0.0, x)) + uv.x * x;
      float yAct = abs(min(0.0, y)) + uv.y * y;

      return (xAct + yAct) / 2.0;
    }
  `,

  closestSide: `
    float getActivation(vec2 uv) {
      float y = mod(uClosestCorner, 2.0) * 2.0 - 1.0;
      float x = (floor(uClosestCorner / 2.0) * 2.0 - 1.0) * -1.0;

      float xAct = abs(min(0.0, x)) + uv.x * x;
      float yAct = abs(min(0.0, y)) + uv.y * y;

      return (xAct + yAct) / 2.0;
    }
  `,
}

const createVertex = (activation, transformationFunction) => {
  return `
  uniform float uProgress;
    uniform vec2 uMeshScale;
    uniform vec2 uMeshPosition;
    uniform vec2 uViewSize;
    uniform vec4 uBeizerControls;
    uniform float uSyncLatestStart;
    uniform float uSeed;
    uniform float uAmplitude;
    uniform float uFrequency;
  
  varying vec2 vUv;
  
  float cubicBezier(float t, float p0, float p1, float p2, float p3) {
    float u = 1.0 - t;
    float tt = t * t;
    float uu = u * u;
    float uuu = uu * u;
    float ttt = tt * t;
  
    float p = p0 * uuu + 3.0 * p1 * uu * t + 3.0 * p2 * u * tt + p3 * ttt;
    return p;
  }
  
  ${activation}

    void main() {
      vec3 pos = position.xyz;
      vec2 uv = uv;

      vec3 transformedPos = pos;
      vec2 transformedUV = uv;

      float activation = getActivation(uv);

      float latestStart = 0.5;
      float startAt = activation * latestStart;
      float vertexProgress = smoothstep(startAt, 1.0, uProgress);

      // Scale to page view size/page size
      vec2 scaleToViewSize = uViewSize / uMeshScale - 1.0;
      vec2 scale = vec2(1.0 + scaleToViewSize * vertexProgress);
      transformedPos.xy *= scale;

      // Move towards center
      transformedPos.y += -uMeshPosition.y * vertexProgress;
      transformedPos.x += -uMeshPosition.x * vertexProgress;

      // Apply the selected transformation
      ${transformationFunction}

      gl_Position = projectionMatrix * modelViewMatrix * vec4(transformedPos, 1.0);
      vUv = transformedUV;
  }
  `;
};

const fragmentShader = `
  uniform sampler2D uTexture;

  varying vec2 vUv;

  void main() {
    vec4 texColor = texture2D(uTexture, vUv);
    gl_FragColor = texColor;
  }
`

export { activations, createVertex, fragmentShader, transformations }
