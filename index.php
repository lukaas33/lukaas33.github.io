<!DOCTYPE html>
<html lang="en">
   <head>
      <!-- Site info -->
      <title>Lucas' resume</title>
      <meta name="Lucas' resume" content="The online resume of Lucas van Osenbruggen.">
      <meta charset="UTF-8">
      <!-- Make favicon at http://realfavicongenerator.net/ -->
	  <link rel="apple-touch-icon" href="favicon/apple-touch-icon.png">
	  <link rel="icon" type="image/png" href="favicon/favicon-32x32.png">
	  <link rel="icon" type="image/png" href="favicon/android-chrome-192x192.png">
	  <link rel="icon" type="image/png" href="favicon/favicon-16x16.png">
	  <link rel="manifest" href="favicon/manifest.json">
	  <link rel="mask-icon" href="favicon/safari-pinned-tab.svg" color="#757575">
	  <link rel="shortcut icon" href="favicon/favicon.ico">
	  <meta name="msapplication-config" content="favicon/browserconfig.xml">
	  <meta name="theme-color" content="#eeeeee">
      <!-- Js, jQuery and Css -->
      <link type="text/css" rel="stylesheet" href="cv.css" /> <!-- My css -->
	  <!--
      <link type="text/css" rel="stylesheet" href="https://github.com/necolas/normalize.css/blob/master/normalize.css" />
        -->
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script> <!-- Easier Js -->
      <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script> <!-- More complex effects -->
	  <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css">
      <script type="text/javascript" src="cv.js"></script> <!-- My Js -->
      <!-- Icons and fonts https://www.fonts.google.com -->
      <link href="https://fonts.googleapis.com/css?family=Noto+Sans" rel="stylesheet"> <!-- Font -->
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"> <!-- Icons -->
   </head>

   <body class="disable-selection">

      <div class="overlay"></div>

      <div class="menu">
         <div class="menuItems">
            <button type="button" class="menuItem theme"><i class="material-icons md-36 md-dark"> palette </i><p> Theme </p></button>
            <button type="button" class="menuItem language"><i class="material-icons md-36 md-dark"> translate</i><p> Language </p></button>
            <button type="button" class="menuItem box"><i class="material-icons md-36 md-dark"> border_clear </i><p> Box view </p></button>
            <button type="button" class="menuItem about"><i class="material-icons md-36 md-dark"> info_outline </i><p> About </p></button>
         </div>
      </div>

      <div class="centerCard changeTheme">
		<h3> Select your theme </h3>
		<br/>
		<hr/>
		<br/>
         <ul>
            <li><button type="button" class="themeOption" id="purple"><i class="material-icons md-24 md-light"> </i></button></li>
            <li><button type="button" class="themeOption" id="teal"><i class="material-icons md-24 md-light"> </i></button></li>
            <li><button type="button" class="themeOption" id="blue"><i class="material-icons md-24 md-light"> </i></button></li>
            <li><button type="button" class="themeOption" id="red"><i class="material-icons md-24 md-light"> </i></button></li>
         </ul>
      </div>

      <div class="centerCard sendMail">
      </div>

      <div class="centerCard aboutWebsite">
      </div>

      <div class="screen">
          <header>
             <button type="button" class="menu-icon hamburger open"><i class="material-icons md-36 md-light"> menu </i></button>
             <div class="headtext">
                <h1> Lucas van Osenbruggen </h1> <!-- Title -->
             </div>
             <nav>
    		 <li class="navMore"><i class="material-icons md-36 md-light down"> keyboard_arrow_down </i></li>
                <ul>
                   <li class="navItem current"><a href="#" id="aboutMe"> About me </a></li>
                   <li class="navItem"><a href="#" id="experience"> Experience </a></li>
                   <li class="navItem"><a href="#" id="skills"> Skills </a></li>
                   <li class="navItem"><a href="#" id="portfolio"> Portfolio </a></li>
                </ul>
             </nav>
             <!--<button type="button" class="FAB top">
                <i class="FABicon material-icons md-36 md-light"> phone </i>
            </button>-->
          </header>

          <div class="main">

             <div class="cards aboutMe goUp">
                <div class="container">
                   <div class="card small">
                      <div class="options">
                         <button class="more">
                         <i class="material-icons md-18 md-light"> more_vert </i>
                         </button>
                         <div class="cardMenu">
                            <button class="cardMenuItem clear"> <i class="material-icons md-24 md-dark"> clear </i><p> Clear card </p></button>
                         </div>
                      </div>
                      <div class="image">
                          <img class="full" src="media/LucasPhoto.jpg" alt="A picture me at the age of 15."> <!-- Images outside text div -->
                       </div>
                      <section class="text">
                         <p> Not a fan of taglines. </p>
                      </section>
                   </div>
                </div>
                <div class="container">
                   <div class="card medium">
                      <div class="options">
                         <button class="more">
                         <i class="material-icons md-18 md-dark"> more_vert </i>
                         </button>
                         <div class="cardMenu">
                            <button class="cardMenuItem clear"> <i class="material-icons md-24 md-dark"> clear </i><p> Clear card </p></button>
                         </div>
                      </div>
                      <section class="text">
                         <h3> About me </h3>
                         <br/>
                         <p>
                            My name is Lucas van Osenbruggen. <br/>
                            I'm <span class="count age"> </span> old and live in the Netherlands. <br/>
                            I made this website from scratch and it serves as my resume as well as my portfolio.
                            It came into existence <span class="count sinceCreated"> </span> ago.
                            It has some cool features like automatically updating numbers <span class="italic">(like my age)</span>, resizeable portfolio projects and a menu. <br/>
                         </p>
                         <br/>
                         <p>
                            To learn about my <span class="tab two">work history</span> or <span class="tab three">skills</span>, and to see some of my work check out the other pages in the navigation bar. <br/>
                            To contact me, use the button in the right corner.
                         </p>
                      </section>
                   </div>
                   <div class="card medium">
                      <div class="options">
                         <button class="more">
                         <i class="material-icons md-18 md-dark"> more_vert </i>
                         </button>
                         <div class="cardMenu">
                            <button class="cardMenuItem clear"> <i class="material-icons md-24 md-dark"> clear </i><p> Clear card </p></button>
                         </div>
                      </div>
                      <section class="text">
                         <h3> Interests </h3>
                         <br/>
    					 <p>
    						I am an Android user,
    						a not so devoted Pastaferian,
    						a member of Google+ create,
    						a nerdfighter,
    						sometimes a local guide
    						and a fan of design and coding.
    					 </p>
    					 <br/>
    					 <p> My favorite artists include: Bastille, Hank and John Green, James Blunt, OneRepublic, Bo Burnham and Hugh Laurie. </p>
                      </section>
                   </div>
                </div>
             </div>

             <div class="cards experience goUp">
                 <div class="container break">
                     <h2> Work history</h2>
                 </div>
                <div class="container">
                   <div class="card big">
                      <div class="options">
                         <button class="more">
                         <i class="material-icons md-18 md-dark"> more_vert </i>
                         </button>
                         <div class="cardMenu">
                            <button class="cardMenuItem clear"> <i class="material-icons md-24 md-dark"> clear </i><p>Clear card</p></button>
                         </div>
                      </div>
                      <section class="text">
    					 <p> Pretty obvious why this is empty. </p>
                      </section>
                   </div>
               </div>
               <!--<div class="container">
                  <div class="card big">
                     <div class="options">
                        <button class="more">
                        <i class="material-icons md-18 md-dark"> more_vert </i>
                        </button>
                        <div class="cardMenu">
                           <button class="cardMenuItem clear"> <i class="material-icons md-24 md-dark"> clear </i><p>Clear card</p></button>
                        </div>
                     </div>
                     <section class="text">
                        <table class="tstandard">
                            <thead>
                                <tr>
                                    <th> Nulla </th>
                                    <th> Lobortis </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td> Vivamus </td>
                                    <td> 63463 </td>
                                </tr>
                                <tr>
                                    <td> Phasellus </td>
                                    <td> 5432 </td>
                                </tr>
                                <tr>
                                    <td> Vulputate </td>
                                    <td> 36673 </td>
                                </tr>
                                <tr>
                                    <td> Turpis </td>
                                    <td> 64335 </td>
                                </tr>
                                <tr>
                                    <td> Aenean </td>
                                    <td> 756885 </td>
                                </tr>
                            </tbody>
                        </table>
                     </section>
                 </div>
             </div> -->
               <div class="container break">
                   <hr/>
                   <br/>
                   <h2> Education</h2>
               </div>
                <div class="container">
                   <div class="card big">
                      <div class="options">
                         <button class="more">
                         <i class="material-icons md-18 md-dark"> more_vert </i>
                         </button>
                         <div class="cardMenu">
                            <button class="cardMenuItem clear"> <i class="material-icons md-24 md-dark"> clear </i><p>Clear card</p></button>
                         </div>
                      </div>
                      <section class="text">
    					 <p> Pretty obvious why this is empty. </p>
                      </section>
                   </div>
                </div>
                <div class="container break">
                    <hr/>
                    <br/>
                    <h2> Online courses </h2>
                </div>
                <div class="container">
                    <div class="card small">
                       <div class="options">
                          <button class="more">
                          <i class="material-icons md-18 md-light"> more_vert </i>
                          </button>
                          <div class="cardMenu">
                             <button class="cardMenuItem clear"> <i class="material-icons md-24 md-dark"> clear </i><p> Clear card </p></button>
                          </div>
                       </div>
                       <div class="image">
                           <a target="_blank" href="https://www.khanacademy.org/profile/lukaas33/"><img class="full" src="https://upload.wikimedia.org/wikipedia/commons/8/87/Khan-Academy-logo.jpg"/></a>
                       </div>
                       <section class="text">
                           <p> Khanacademy </p>
                       </section>
                    </div>
                 </div>
                 <div class="container">
                     <div class="card small">
                        <div class="options">
                           <button class="more">
                           <i class="material-icons md-18 md-light"> more_vert </i>
                           </button>
                           <div class="cardMenu">
                              <button class="cardMenuItem clear"> <i class="material-icons md-24 md-dark"> clear </i><p> Clear card </p></button>
                           </div>
                        </div>
                        <div class="image">
                            <a target="_blank" href="https://www.codecademy.com/Lukaas33"><img class="full" src="https://production.cdmycdn.com/assets/logo-codecademy-social-abfd8450722d675bddedde689f8af624.png"/></a>
                        </div>
                        <section class="text">
                            <p> Codecademy </p>
                        </section>
                     </div>
                  </div>
                   <div class="container">
                       <div class="card small">
                          <div class="options">
                             <button class="more">
                             <i class="material-icons md-18 md-light"> more_vert </i>
                             </button>
                             <div class="cardMenu">
                                <button class="cardMenuItem clear"> <i class="material-icons md-24 md-dark"> clear </i><p> Clear card </p></button>
                             </div>
                          </div>
                          <div class="image">
                              <a target="_blank" href="https://www.typing.com"><img class="full" src="http://cdn01.ovonni.com/uploads/2016/201610/20161012/source-img/1476207766674-P-251243.jpg"/></a>
                          </div>
                          <section class="text">
                              <p> Typing </p>
                          </section>
                       </div>
                    </div>
                    <div class="container">
                        <div class="card small">
                           <div class="options">
                              <button class="more">
                              <i class="material-icons md-18 md-dark"> more_vert </i>
                              </button>
                              <div class="cardMenu">
                                 <button class="cardMenuItem clear"> <i class="material-icons md-24 md-dark"> clear </i><p> Clear card </p></button>
                              </div>
                           </div>
                           <div class="image">
                               <a target="_blank" href="https://www.duolingo.com/lukaas33"><img class="full" src="https://www.duolingo.com/images/illustrations/owl-happy@2x.png"/></a>
                           </div>
                           <section class="text">
                               <p> Duolingo </p>
                           </section>
                        </div>
                     </div>
             </div>

             <div class="cards skills goUp">
                <div class="container">
                   <div class="card medium">
                      <div class="options">
                         <button class="more">
                         <i class="material-icons md-18 md-dark"> more_vert </i>
                         </button>
                         <div class="cardMenu">
                            <button class="cardMenuItem clear"> <i class="material-icons md-24 md-dark"> clear </i><p>Clear card</p></button>
                         </div>
                      </div>
                      <section class="text">
                         <br/>
                         <div class="progressBar">
                            <div class="progress normal" style="width: 65%">
    							<p> Web development </p>
                            </div>
                         </div>
                         <br/>
                         <div class="collapse">
                            <li>
                               <h2> Skill breakdown </h2>
                               <div>
                                  <div class="progressBar">
                                     <div class="progress small" style="width: 55%">
                                        <p> Html </p>
                                     </div>
                                  </div>
                                  <br/>
                                  <div class="progressBar">
                                     <div class="progress small" style="width: 58%">
                                        <p> Css </p>
                                     </div>
                                  </div>
                                  <br/>
                                  <div class="progressBar">
                                     <div class="progress small" style="width: 47%">
                                        <p> Js </p>
                                     </div>
                                  </div>
                               </div>
                            </li>
                            <li>
                               <h2> More </h2>
                               <div>
                                  <p>
    							    I first learned about html at school around <span class="count sinceHtml"> </span> ago. </br>
    								After that I took some courses on Codeacademy and Khanacademy. Checkout courses at the <span class="tab two">experience tab</span>. </br>
    								This is only one of the websites I made. Checkout the others in the <span class="tab four">portfolio tab</span>.
    							  </p>
                               </div>
                            </li>
                         </div>
                      </section>
                   </div>
                   <div class="card medium">
                      <div class="options">
                         <button class="more">
                         <i class="material-icons md-18 md-dark"> more_vert </i>
                         </button>
                         <div class="cardMenu">
                            <button class="cardMenuItem clear"> <i class="material-icons md-24 md-dark"> clear </i><p> Clear card </p></button>
                         </div>
                      </div>
                      <section class="text">
                         <br/>
                         <div class="progressBar">
                            <div class="progress normal" style="width: 25%">
    							<p> Graphic design </p>
                            </div>
                         </div>
                         <br/>
                         <div class="collapse">
                            <li>
                               <h2> Skill breakdown </h2>
                               <div>
                                  <div class="progressBar">
                                     <div class="progress small" style="width: 23%">
                                        <p> Illustrator </p>
                                     </div>
                                  </div>
                                  <br/>
                                  <div class="progressBar">
                                     <div class="progress small" style="width: 16%">
                                        <p> Photoshop </p>
                                     </div>
                                  </div>
                                  <br/>
                                  <div class="progressBar">
                                     <div class="progress small" style="width: 55%">
                                        <p> Color </p>
                                     </div>
                                  </div>
                               </div>
                            </li>
                            <li>
                               <h2> More </h2>
                               <div>
                                  <p>
    								I mostly learned designing by trying things.
                                    For a timeline of my attempts check out my <a target="_blank" href="https://plus.google.com/+LucasvanOsenbruggen">Google+</a>.</br>
                                    The projects I deemed worthy can be found in the <span class="tab four">portfolio tab</span>. </br>
                                    <br/>
                                    My favorite color pallete is that of <a target="_blank" href="https://material.io/guidelines/style/color.html">Material Design</a>.
    							  </p>
                               </div>
                            </li>
                         </div>
                      </section>
                   </div>
                </div>
                <div class="container">
                   <div class="card small">
                      <div class="options">
                         <button class="more">
                         <i class="material-icons md-18 md-dark"> more_vert </i>
                         </button>
                         <div class="cardMenu">
                            <button class="cardMenuItem clear"> <i class="material-icons md-24 md-dark"> clear </i><p>Clear card</p></button>
                         </div>
                      </div>
                      <section class="text">
                         <h4> Languages </h4>
                         <br/>
                         <div class="progressBar">
                            <div class="progress normal" style="width: 85%">
                               <p> Dutch </p>
                            </div>
                         </div>
    					 <br/>
                         <div class="collapse">
                            <li>
                               <h2> More </h2>
                               <div>
                                  <p>
    								I have been able to talk Dutch for about <span class="count sinceNL"> </span>. <br/>
                                    It is my native language.
    							  </p>
                               </div>
                            </li>
                         </div>
                         <br/>
                         <div class="progressBar">
                            <div class="progress normal" style="width: 73%">
                               <p> English </p>
                            </div>
                         </div>
    					 <br/>
                         <div class="collapse">
                            <li>
                               <h2> More </h2>
                               <div>
                                  <p>
    								I started learning English at school around <span class="count sinceEN"> </span> ago. <br/>
    								I spend much time on the computer and in most of my online life I talk English.
    							  </p>
                               </div>
                            </li>
                         </div>
                         <br/>
                         <div class="progressBar">
                            <div class="progress normal" style="width: 34%">
                               <p> German </p>
                            </div>
                         </div>
    					 <br/>
                         <div class="collapse">
                            <li>
                               <h2> More </h2>
                               <div>
                                  <p>
    								I started learning German in school around <span class="count sinceGE"> </span> ago.
    							  </p>
                               </div>
                            </li>
                         </div>
                      </section>
                   </div>
                </div>
               <!--<div class="container">
                   <div class="card big">
                      <div class="options">
                         <button class="more">
                         <i class="material-icons md-18 md-dark"> more_vert </i>
                         </button>
                         <div class="cardMenu">
                            <button class="cardMenuItem clear"> <i class="material-icons md-24 md-dark"> clear </i><p> Clear card </p></button>
                         </div>
                      </div>
                      <section class="text">
                      </section>
                  </div>
              </div>-->
             </div>

             <div class="cards portfolio goUp">
                 <div class="container">
                     <div class="card small resizable">
                        <div class="options">
                           <button class="more">
                           <i class="material-icons md-18 md-light"> more_vert </i>
                           </button>
                           <div class="cardMenu">
                              <button class="cardMenuItem clear"> <i class="material-icons md-24 md-dark"> clear </i><p> Clear card </p></button>
                              <button class="cardMenuItem resize"> <i class="material-icons md-24 md-dark"> crop_free </i><p> Resize </p></button>
                          </div>
                        </div>
                        <div class="image">
                            <a href="webpages/boarding/index.html"><img class="full" src="media/boardingBanner.jpg"/></a>
                        </div>
                        <section class="text">
                          <h3> Boarding </h3>
                          <br/>
                          <p> My Android boarding screen. </p>
                          <br/>
                          <div class="collapse">
                              <li>
                                  <h2>  Story </h2>
                                  <div>
                                  </div>
                              </li>
                              <li>
                                  <h2> Details </h2>
                                  <div>
                                  </div>
                              </li>
                          </div>
                        </section>
                     </div>
                 </div>
                <div class="container">
                   <div class="card small resizable">
                      <div class="options">
                         <button class="more">
                         <i class="material-icons md-18 md-light"> more_vert </i>
                         </button>
                         <div class="cardMenu">
                            <button class="cardMenuItem clear"> <i class="material-icons md-24 md-dark"> clear </i><p> Clear card </p></button>
                            <button class="cardMenuItem resize"> <i class="material-icons md-24 md-dark"> crop_free </i><p> Resize </p></button>
                        </div>
                      </div>
                      <div class="image">
                          <a href="webpages/picturer/index.html"><img class="full" src="media/tealP.jpg"/></a>
                      </div>
                      <section class="text">
                        <h3> Picturer </h3>
                        <br/>
                        <p> Make your own profile picture. </p>
                        <br/>
                        <div class="collapse">
                            <li>
                                <h2>  Story </h2>
                                <div>
                                </div>
                            </li>
                            <li>
                                <h2> Details </h2>
                                <div>
                                </div>
                            </li>
                        </div>
                      </section>
                   </div>
                </div>
                <div class="container">
                    <div class="card small resizable">
                       <div class="options">
                          <button class="more">
                          <i class="material-icons md-18 md-light"> more_vert </i>
                          </button>
                          <div class="cardMenu">
                             <button class="cardMenuItem clear"> <i class="material-icons md-24 md-dark"> clear </i><p> Clear card </p></button>
                             <button class="cardMenuItem resize"> <i class="material-icons md-24 md-dark"> crop_free </i><p> Resize </p></button>
                         </div>
                       </div>
                       <div class="image">
                           <a href="webpages/solaris/index.html"><img class="full" src="media/solaris.jpg"/></a>
                       </div>
                       <section class="text">
                         <h3> Solaris </h3>
                         <br/>
                         <p> Learn about the solar system. </p>
                         <br/>
                         <div class="collapse">
                             <li>
                                 <h2>  Story </h2>
                                 <div>
                                 </div>
                             </li>
                             <li>
                                 <h2> Details </h2>
                                 <div>
                                 </div>
                             </li>
                         </div>
                       </section>
                    </div>
                </div>
             </div>

             <div>
                  <button type="button" class="FAB bottom">
                     <i class="FABicon material-icons md-36 md-light"> mail </i>
                  </button>
              </div>

          <div class="undo">
             <button class="undoButton">
                    <p> Undo </p><i class="undoIcon material-icons md-24 md-light"> subdirectory_arrow_left </i>
             </button>
          </div>

    	</div>
    </div>

   </body>
</html>
