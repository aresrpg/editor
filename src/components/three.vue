<template lang="pug">
canvas#webgl(ref="canvas")
</template>

<script setup>
import { WebGLRenderer, Scene, PerspectiveCamera } from 'three';
import OrbitControls from 'three-orbitcontrols';
import { MinecraftTextureLoader, ElementMesh } from '@oran9e/three-mcmodel';
import { MinecraftModel } from '@oran9e/minecraft-model';
import { ElementGeometry } from '@oran9e/three-mcmodel/dist/geometry';
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';

const props = defineProps([
  'model_json',
  'model_texture_blob',
  'model_mcmeta_json',
]);
const canvas = ref(null);
const animation_timer = ref(0);
const scene = new Scene();
const camera = new PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);

let animation_frame = 0;
const normalize_json_display = ({ display: { fixed }, ...item }) => ({
  ...item,
  display: {
    fixed,
  },
});

camera.position.set(16, 16, 64);

const render_model = async ({
  model_json,
  model_mcmeta_json: { animation: { frametime = 2 } = {} } = {},
  model_texture_blob,
}) => {
  clearInterval(animation_timer.value);

  if (model_json && model_texture_blob) {
    const { elements, textures } = MinecraftModel.fromJson(
      normalize_json_display(model_json),
      []
    );
    const textureLoader = new MinecraftTextureLoader();
    const texture = await textureLoader.load(
      URL.createObjectURL(model_texture_blob)
    );

    elements.forEach(element => {
      const geometry = new ElementGeometry(element, textures).translate(
        -8,
        -8,
        -8
      );
      const mesh = new ElementMesh(geometry, textures);
      mesh.resolveTextures(() => texture);
      scene.add(mesh);
    });

    let index = 0;
    animation_timer.value = setInterval(() => {
      texture.setAnimationFrame(index++);
    }, 50 * frametime);
  }
};

onMounted(async () => {
  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas: canvas.value,
  });
  const controls = new OrbitControls(camera, renderer.domElement);

  renderer.setSize(window.innerWidth, window.innerHeight);
  // window.addEventListener('resize', () => {
  //   camera.aspect = window.innerWidth / window.innerHeight;
  //   camera.updateProjectionMatrix();
  //   renderer.setSize(window.innerWidth, window.innerHeight);
  // });

  controls.enableKeys = false;
  controls.screenSpacePanning = true;

  await render_model(props);

  function animate() {
    animation_frame = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animation_frame);
});

// watch(props, render_model);
</script>
