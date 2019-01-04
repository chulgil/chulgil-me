<template>
    <section class="hero is-fullheight">
      <no-ssr>
        <vue-particles
          color="#ddd"
          :particleOpacity="0.7"
          :particlesNumber="80"
          shapeType="circle"
          :particleSize="4"
          linesColor="#777"
          :linesWidth="1"
          :lineLinked="true"
          :lineOpacity="0.4"
          :linesDistance="150"
          :moveSpeed="3"
          :hoverEffect="true"
          hoverMode="grab"
          :clickEffect="false"
          clickMode="push"
        >
        </vue-particles>
    </no-ssr>

      <!-- Hero content: will be in the middle -->
      <div class="hero-body">
        
        <div class="container has-text-centered">
          
        <div class=" columns is-centered has-text-centered">
          <div class="column"></div>
          <div class="box column is-7 is-6-desktop is-8-tablet" >
            <div class="columns">
              <div class="column is-one-third  hero is-dark">
                <br>
                <nav class="level">
                  <div class="level-item has-text-centered">
                    <figure class='image' style='width:140px'><img class='is-rounded' src='https://pbs.twimg.com/profile_images/1080492550366973952/Bt-4aQ-J_400x400.jpg'></figure>
                  </div>
                </nav>
                <h1 class="title is-4">Chulgil.Lee</h1>
                <h2 class="subtitle is-6">
                  FullStack Developer
                </h2>
                <p></p>
              </div>
              <div class="column is-8 has-text-left">
                <div class="column">
                    <nav class="breadcrumb is-right" aria-label="breadcrumbs">
                    <ul>
                      <li><a href="https://twitter.com/chulgil_lee"><i class="fab fa-2x fa-twitter-square"></i></a></li>
                      <li><a href="https://www.facebook.com/chulgil2"><i class="fab fa-2x fa-facebook-square"></i></a></li>
                      <li><a href="https://www.instagram.com/chulgillee/"><i class="fab fa-2x fa-instagram"></i></a></li>
                      <li><a href="https://github.com/chulgil"><i class="fab fa-2x fa-github"></i></a></li>
                    </ul>
                  </nav>
                </div>
                <br>
                <h1 class=" has-text-centered"><img style="width:100px;" src="~/assets/qrcode_chulgil_me.png"></h1>
                
                <div class=" fa-ul">
                    <div class="container" >
                      <ul>
                        <br>
                        <li><i class="fa-li fas fa-phone"></i><h3 class="subtitle is-5">310-748-3824</h3></li>
                        <li><i class="fa-li fas fa-home"></i>https://chulgil.me</li>
                        <li><i class="fa-li fas fa-envelope"></i>contact@chulgil.me</li>
                        <li><i class="fa-li fas fa-map-marker-alt"></i>
                            5441 N East River Rd Chicago, IL 
                        </li>
                      </ul>
                    </div>
                </div>
              </div>
              
            </div>
		      </div>
          <div class="column"></div>
		    </div>
        </div>
      </div>

    </section>

</template>

<script>
  export default {
 

  };
</script>

<style>
 .particles-js-canvas-el {
    background-size: cover;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>