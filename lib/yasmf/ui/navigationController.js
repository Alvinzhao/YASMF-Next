/**
 *
 * Navigation Controllers provide basic support for view stack management (as in push, pop)
 * 
 * navigationController.js
 * @author Kerri Shotts
 * @version 0.4
 *
 * Copyright (c) 2013 Kerri Shotts, photoKandy Studios LLC
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this 
 * software and associated documentation files (the "Software"), to deal in the Software 
 * without restriction, including without limitation the rights to use, copy, modify, 
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to 
 * permit persons to whom the Software is furnished to do so, subject to the following 
 * conditions:
 * The above copyright notice and this permission notice shall be included in all copies 
 * or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE 
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT 
 * OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR 
 * OTHER DEALINGS IN THE SOFTWARE.
 */
/*jshint
         asi:true,
         bitwise:true,
         browser:true,
         camelcase:true,
         curly:true,
         eqeqeq:false,
         forin:true,
         noarg:true,
         noempty:true,
         plusplus:false,
         smarttabs:true,
         sub:true,
         trailing:false,
         undef:true,
         white:false,
         onevar:false 
 */
/*global define*/

define ( ["yasmf/ui/core", "yasmf/ui/viewContainer"], function ( UI, ViewContainer )
{
   var _className = "NavigationController";
   var NavigationController = function ()
   {
      var self = new ViewContainer();
      self.subclass ( _className );

      self.registerNotification ( "viewPushed" );
      self.registerNotification ( "viewPopped" );
      self.registerNotification ( "modalViewPushed" );

      /**
       * The array of views that this navigation controller manages.
       * @type {Array}
       */
      self._subviews = [];
      self.getSubviews = function ()
      {
         return self._subviews;
      }
      Object.defineProperty ( self, "subviews", 
                              { get: self.getSubviews,
                                configurable: true } );
      self.getTopView = function ()
      {
         if (self._subviews.length > 0 )
         {
           return self._subviews[ self._subviews.length - 1 ];
         }
         else
         {
            return null;
         }
      }
      Object.defineProperty ( self, "topView", 
                              { get: self.getTopView,
                                configurable: true } );

      self.getRootView = function ()
      {
         if (self._subviews.length > 0 )
         {
           return self._subviews[ 0 ];
         }
         else
         {
            return null;
         }
      }
      self.__defineGetter__ ( "rootView", self.getRootView );
      Object.defineProperty ( self, "rootView", 
                              { get: self.getRootView,
                                configurable: true } );

      self.pushView = function ( aView, withAnimation, withDelay, withType )
      {
         var theHidingView = self.topView;
         var theShowingView = aView;
         var usingAnimation = true;
         var animationDelay = 0.3;
         var animationType = "ease-in-out";

         if (typeof withAnimation !== "undefined") { usingAnimation = withAnimation; }
         if (typeof withDelay !== "undefined") { animationDelay = withDelay; }
         if (typeof withType !== "undefined") { animationType = withType; }

         if (!usingAnimation) { animationDelay = 0; }

         // add the view to our array, at the end
         self._subviews.push ( theShowingView );
         theShowingView.navigationController = self;
         theShowingView.notify ( "viewWasPushed" );

         // get each element's z-index, if specified
         var theHidingViewZ = getComputedStyle(theHidingView.element).getPropertyValue("z-index") || "0",
             theShowingViewZ= getComputedStyle(theShowingView.element).getPropertyValue("z-index") || "0";

         // then position the view so as to be off-screen, with the current view on screen
         UI.styleElement ( theHidingView.element, "transform", "translate3d(0,0," + theHidingViewZ + "px)");
         UI.styleElement ( theShowingView.element, "transform", "translate3d(100%,0," + theShowingViewZ + "px)");

         // set up an animation
         if (usingAnimation)
         {
           UI.styleElements ( [theShowingView.element, theHidingView.element], "transition", "-webkit-transform " + animationDelay + "s " + animationType);
           UI.styleElements ( [theShowingView.element, theHidingView.element], "transition", "-moz-transform " + animationDelay + "s " + animationType);
           UI.styleElements ( [theShowingView.element, theHidingView.element], "transition", "-ms-transform " + animationDelay + "s " + animationType);
           UI.styleElements ( [theShowingView.element, theHidingView.element], "transition", "transform " + animationDelay + "s " + animationType);
           UI.styleElements ( theHidingView.element.querySelectorAll (".ui-navigation-bar *"), "transition", "opacity " + animationDelay + "s " + animationType );
           UI.styleElements ( theShowingView.element.querySelectorAll (".ui-navigation-bar *"), "transition", "opacity " + animationDelay + "s " + animationType );
           UI.styleElements ( theHidingView.element.querySelectorAll (".ui-navigation-bar *"), "opacity", "1" );
           UI.styleElements ( theShowingView.element.querySelectorAll (".ui-navigation-bar *"), "opacity", "0" );
         }
         else
         {
           UI.styleElements ( [theShowingView.element, theHidingView.element], "transition", "inherit" );
           UI.styleElements ( theHidingView.element.querySelectorAll (".ui-navigation-bar *"), "transition", "inherit" );
           UI.styleElements ( theShowingView.element.querySelectorAll (".ui-navigation-bar *"), "transition", "inherit" );
         }

         // and add the element with us as the parent
         theShowingView.parentElement = self.element;

         setTimeout ( function ()
         {
            // tell the topView to move over to the left         
            UI.styleElement ( theHidingView.element, "transform", "translate3d(-100%,0," + theHidingViewZ + "px)");

            // and tell our new view to move as well
            UI.styleElement ( theShowingView.element, "transform", "translate3d(0,0," + theShowingViewZ + "px)");

            if (usingAnimation)
            {
               UI.styleElements ( theHidingView.element.querySelectorAll (".ui-navigation-bar *"), "opacity", "0" );
               UI.styleElements ( theShowingView.element.querySelectorAll (".ui-navigation-bar *"), "opacity", "1" );
            }

            // the the view it's about to show...
            theHidingView.notify ( "viewWillDisappear" );
            theShowingView.notify ( "viewWillAppear" );

            // tell anyone who is listening who got pushed
            self.notify ( "viewPushed", [theShowingView] );

            // tell the view it's visible after the delay has passed
            setTimeout ( function () 
                         { 
                           theHidingView.notify ( "viewDidDisappear" ); 
                           theShowingView.notify ( "viewDidAppear" );
                         }, animationDelay * 1000 );            
         }, 50);
      }

      self.popView = function ( withAnimation, withDelay, withType )
      {
         var usingAnimation = true;
         var animationDelay = 0.3;
         var animationType = "ease-in-out";

         if (typeof withAnimation !== "undefined") { usingAnimation = withAnimation; }
         if (typeof withDelay !== "undefined") { animationDelay = withDelay; }
         if (typeof withType !== "undefined") { animationType = withType; }

         if (!usingAnimation) { animationDelay = 0; }

         // pop the top view off the stack
         var thePoppingView = self._subviews.pop();
         var theShowingView = self.topView;

         var thePoppingViewZ = getComputedStyle(thePoppingView.element).getPropertyValue("z-index") || "0",
             theShowingViewZ = getComputedStyle(theShowingView.element).getPropertyValue("z-index") || "0";

         // make sure that theShowingView is off screen to the left, and the popping
         // view is at 0
         UI.styleElements ( [thePoppingView.element, theShowingView.element], "transition", "inherit" );
         UI.styleElements ( thePoppingView.element.querySelectorAll (".ui-navigation-bar *"), "transition", "inherit" );
         UI.styleElements ( theShowingView.element.querySelectorAll (".ui-navigation-bar *"), "transition", "inherit" );
         UI.styleElement ( theShowingView.element, "transform", "translate3d(-100%,0," + theShowingViewZ + "px)");
         UI.styleElement ( thePoppingView.element, "transform", "translate3d(0,0," + thePoppingViewZ + "px");
         if (usingAnimation)
         {
            UI.styleElements ( theShowingView.element.querySelectorAll (".ui-navigation-bar *"), "opacity", "0" );
            UI.styleElements ( thePoppingView.element.querySelectorAll (".ui-navigation-bar *"), "opacity", "1" );
         }
         else
         {            
            UI.styleElements ( theShowingView.element.querySelectorAll (".ui-navigation-bar *"), "opacity", "1" );
            UI.styleElements ( thePoppingView.element.querySelectorAll (".ui-navigation-bar *"), "opacity", "1" );
         }

         // set up an animation
         if (usingAnimation)
         {
           UI.styleElements ( [thePoppingView.element, theShowingView.element], "transition", "-webkit-transform " + animationDelay + "s " + animationType);
           UI.styleElements ( [thePoppingView.element, theShowingView.element], "transition", "-moz-transform " + animationDelay + "s " + animationType);
           UI.styleElements ( [thePoppingView.element, theShowingView.element], "transition", "-ms-transform " + animationDelay + "s " + animationType);
           UI.styleElements ( [thePoppingView.element, theShowingView.element], "transition", "transform " + animationDelay + "s " + animationType);
           UI.styleElements ( thePoppingView.element.querySelectorAll (".ui-navigation-bar *"), "transition", "opacity " + animationDelay + "s " + animationType );
           UI.styleElements ( theShowingView.element.querySelectorAll (".ui-navigation-bar *"), "transition", "opacity " + animationDelay + "s " + animationType );
         }

         setTimeout (function () {
            // and move everyone
            UI.styleElement ( theShowingView.element, "transform", "translate3d(0,0," + theShowingViewZ + "px)");
            UI.styleElement ( thePoppingView.element, "transform", "translate3d(100%,0," + thePoppingViewZ + "px)");
            if (usingAnimation)
            {
               UI.styleElements ( thePoppingView.element.querySelectorAll (".ui-navigation-bar *"), "opacity", "0" );
               UI.styleElements ( theShowingView.element.querySelectorAll (".ui-navigation-bar *"), "opacity", "1" );
            }

            // the the view it's about to show...
            thePoppingView.notify ( "viewWillDisappear" );
            theShowingView.notify ( "viewWillAppear" );

            // tell the view it's visible after the delay has passed
            setTimeout ( function () 
                         { 
                          thePoppingView.notify ( "viewWasPopped" );
                           thePoppingView.notify ( "viewDidDisappear" ); 
                           theShowingView.notify ( "viewDidAppear" );
                            // tell anyone who is listening who got popped
                            self.notify ( "viewPopped", [thePoppingView] );

                           // and remove the popping view from the hierarchy
                           thePoppingView.parentElement = null;
                           delete thePoppingView.navigationController;
                         }, (animationDelay * 1000) );
         }, 50);
      }

      self.overrideSuper ( self.class, "render", self.render );
      self.render = function ()
      {
         return ""; // nothing to render!
      }

      self.overrideSuper ( self.class, "renderToElement", self.renderToElement );
      self.renderToElement = function ()
      {
         self.createElementIfNotCreated();
         return; // nothing to do.
      }

      self.overrideSuper ( self.class, "init", self.init );
      self.init = function ( theRootView, theElementId, theElementTag, theElementClass, theParentElement )
      {
         if (typeof theRootView === "undefined") { throw new Error ( "Can't initialize a navigation controller without a root view." ); }

         // do what a normal view container does
         self.super ( _className, "init", [ theElementId, theElementTag, theElementClass, theParentElement ] );

         // now add the root view
         self._subviews.push (theRootView); // add it to our views
         theRootView.navigationController = self;
         theRootView.notify ( "viewWillAppear" ); // notify the view
         theRootView.parentElement = self.element; // and make us the parent
         theRootView.notify ( "viewDidAppear" ); // and notify it that it's actually there.
      }

      self.overrideSuper ( self.class, "initWithOptions", self.initWithOptions );
      self.initWithOptions = function ( options )
      {
         var theRootView, theElementId, theElementTag, theElementClass, theParentElement;
         if (typeof options !== "undefined")
         {
            if ( typeof options.id !== "undefined" ) { theElementId = options.id; }
            if ( typeof options.tag !== "undefined" ) { theElementTag = options.tag; }
            if ( typeof options.class !== "undefined") { theElementClass = options.class; }
            if ( typeof options.parent !== "undefined") { theParentElement = options.parent; }
            if ( typeof options.rootView !== "undefined") { theRootView = options.rootView; }            
         }
         self.init ( theRootView, theElementId, theElementTag, theElementClass, theParentElement );
      }

      return self;
   }
   return NavigationController; 
});