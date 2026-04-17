function pageNoise() {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const renderer = new THREE.WebGLRenderer({ alpha: true });

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const geometry = new THREE.PlaneGeometry(2, 2);

  const material = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      u_time: { value: 0.0 },
      u_color: { value: new THREE.Color("#ffffff") },
    },
    vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
    fragmentShader: `
                varying vec2 vUv;
                uniform float u_time;
                uniform vec3 u_color; 

                float random(vec2 st) {
                    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
                }

                void main() {
                    vec2 uv = vUv * 800.0; 
                    float noise = random(uv + u_time);
                    
                    // The strength of the overlay (0.05 is 5% opacity)
                    float grainOpacity = 0.05; 
                    
                    // Output the color, but use the noise to make it randomly transparent
                    gl_FragColor = vec4(u_color, noise * grainOpacity);
                }
            `,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    material.uniforms.u_time.value = clock.getElapsedTime();
    renderer.render(scene, camera);
  }

  animate();
}

const bgMusic = new Howl({
  src: "../assets/ambient.mp3",
  loop: true,
  volume: 0.0,
  preload: true,
});

const bgMusic2 = new Howl({
  src: "../assets/ambient2.mp3",
  loop: true,
  volume: 0.0,
  preload: true,
});

function playAndFadeIn() {
  bgMusic.play();
  bgMusic2.play();
  bgMusic.fade(0.0, 0.1, 300);
  bgMusic2.fade(0.0, 0.1, 300);
}

function muteWithEase() {
  const currentVol = bgMusic.volume();
  bgMusic.fade(currentVol, 0.0, 300);
  bgMusic2.fade(currentVol, 0.0, 300);
}

/*document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    bgMusic.pause();
    bgMusic2.pause();
  } else {
    bgMusic.play();
    bgMusic2.play();
  }
});*/

pageNoise();
playAndFadeIn();

const questionGroups = document.querySelectorAll(".input-group");
let currentIndex = 0;

function animateIn(group) {
  const label = group.querySelector("label");
  const input = group.querySelector("input");
  const btn = group.querySelector("button");

  gsap.set(group, { display: "flex", opacity: 1, pointerEvents: "auto" });

  let split = new SplitText(label, { type: "words, chars" });

  gsap.set(split.chars, { opacity: 0 });
  gsap.set([input, btn], { opacity: 0 });

  let tl = gsap.timeline();
  tl.to(split.chars, {
    opacity: 1,
    stagger: { amount: 0.7 },
    duration: 2.7,
    ease: "power1.inOut",
  })
    .to(
      input,
      {
        opacity: 1,
        ease: "power1.inOut",
        duration: 2.7,
      },
      "-=2.5",
    )
    .to(
      btn,
      {
        opacity: 1,
        duration: 2.7,
        ease: "power1.inOut",
      },
      "-=2.5",
    );
}

function animateOut(group, onCompleteCallback) {
  gsap.to(group, {
    opacity: 0,
    duration: 1,
    ease: "power1.inOut",
    onComplete: () => {
      gsap.set(group, { display: "none", pointerEvents: "none" });
      if (onCompleteCallback) onCompleteCallback();
    },
  });
}

questionGroups.forEach((group, index) => {
  const btn = group.querySelector("button");

  btn.addEventListener("click", (e) => {
    e.preventDefault();

    const input = group.querySelector("input");
    if (!input.value.trim()) {
      return;
    }

    const isLastQuestion = index === questionGroups.length - 1;

    if (isLastQuestion) {
      const allInputs = document.querySelectorAll("#notionForm input");

      const formData = {
        Nome: allInputs[0].value,
        Espaco: allInputs[1].value,
        Iluminacao: allInputs[2].value,
        Aroma: allInputs[3].value,
        Jantar: allInputs[4].value,
        Adjetivos: allInputs[5].value,
        Sensacao: allInputs[6].value,
        Memoria: allInputs[7].value,
        Tendencia: allInputs[8].value,
      };

      console.log("Data ready for Notion API:", formData);

      animateOut(group, async () => {
        console.log("Form complete. Triggering Notion API...");

        try {
          const response = await fetch("/.netlify/functions/submit-form", {
            method: "POST",
            body: JSON.stringify(formData),
          });

          if (response.ok) {
            console.log("Success! Data perfectly sent to Notion.");
          } else {
            console.error("Error: Backend rejected the data.");
          }
        } catch (error) {
          console.error("Error: Something went wrong with the fetch.", error);
        }
      });
    } else {
      animateOut(group, () => {
        animateIn(questionGroups[index + 1]);
      });
    }
  });
});

animateIn(questionGroups[0]);
