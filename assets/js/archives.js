$(document).ready(function() {
    var token;
    if (localStorage.getItem("token") === null) {
      window.location.replace('../login')
    } else {
      token = localStorage.getItem("token");

    }

    //VARIABLES
        //Variables to hold when right clicking on row
        var clickedId;
        var clickedRow;
        var clickedRowType;
        var revCode;
        var parent = 0;
        var currentName = 'Home'
        var prevName = "Home";
        var prevParent;


        //type of folder user is in
        var docType = 'folder';

    //TOP MENU

        //Make list items draggable and droppable, even if from AJAX request
        makeDroppable = function () {
          $(".item-row").droppable({
              over: function(event, ui) {
                  $(this).addClass("highlighter_focus_in");
              },
              out: function(event, ui) {
                  $(this).removeClass("highlighter_focus_in");
              },
              drop: function( event, ui ) {
                  var drag = $(ui.draggable).attr("id");
                  var dragType = $(ui.draggable).attr("row-type");

                  var drop = $(this).attr("id");
                  var dropType = $(this).attr("row-type");
                  var body = {}
                  body.parent = drop;
                  body = JSON.stringify(body);
                  $.ajax({
                      url: "http://localhost:3000/v1/"+dragType+"s/" + drag,
                      method: "PUT",
                      data: body,
                      dataType: 'json',
                      headers: { "Auth": token },
                      contentType: "application/json",
                       success: function(result,status,jqXHR ){
                          console.log(result);
                          getDocuments();
                       },
                       error(jqXHR, textStatus, errorThrown){
                         console.log(errorThrown);
                       }
                  });

                  console.log(drop);
                  console.log(dropType);
                  console.log(drag);
                  console.log(dragType);


              }
          }).draggable({
              revert: true,
              zIndex: 2500,
              distance: 10,
              revertDuration: 200,
              delay: 200,
              live:true
          });
        };



        //When clicking on logo take back to beginning
        $('#brand').click(function () {
           parent = 0;
           getDocuments();
        });

        //Focus on Open Modals
        $('#folderModal').on('shown.bs.modal', function () {
            $('#folderName').val('').focus();
        });

        $('#documentModal').on('shown.bs.modal', function () {
            $('#documentName').val('').focus();
        });

        $('#revisionModal').on('shown.bs.modal', function () {
            $('#revisionName').val('').focus();
        });

        $('#renameModal').on('shown.bs.modal', function () {
            $('#renameName').focus();
        });



        //Execute function when Enter key hit
        $('.modal-text').keypress(function (e) {
            var modal = ($(this).attr('id'));
            var key = e.which;
            if(key == 13)  // the enter key code
            {
                $('#' + modal + 'Button').click();
                return false;
            }
        });

        $('#searchText').focus(function()
          {
              /*to make this flexible, I'm storing the current width in an attribute*/
              $(this).attr('data-default', $(this).width());
              $(this).attr("placeholder", "Enter Document Number");
              $(this).animate({ width: 250 }, 'slow');
          }).blur(function()
          {
              /* lookup the original width */
              var w = $(this).attr('data-default');
              $(this).attr("placeholder", "Search");

              $(this).animate({ width: 100 }, 'slow');
          }
        );

        $('#searchText').keypress(function (e) {
          var key = e.which;
          if(key == 13)  // the enter key code
          {
            var searchText = $('#searchText').val();
            if (parent === 0 || parent === "0"){
              $('.sad').text('Home')
              $('.previous-breadcrumb').attr('id', 0)
            }

            $('#currentBread').text(searchText);

            $('#searchText').val('');
            if (searchText !== ''){
              searchDocuments(searchText);
            }
          }
        });

    //EDIT DOCUMENT

        // Disable all checkboxes
        disableCheckboxes = function (){
            $('.checkbox .form-check-input').prop('checked', false);
        }

        // Show Checkbox on hover
        $('body').on("mouseover",'.item', function(){
            $("input:checkbox:not(:checked)").hide();
            $($(this).find(':input')).show();
        });

        $('body').on("click",'.checkbox .form-check-input', function(){
            if ($(this).is(":checked")){
                if ($(this).hasClass('archiveChecks')){
                    $('#activateDocument').show();
                } else {

                    disableCheckboxes();
                    $(this).prop('checked', true);
                    $("input:checkbox:not(:checked)").hide();
                    $('#editDocument').fadeIn();

                    clickedId = $(this).parent().next().attr('id');
                    clickedRow = $(this).parent().next().text();
                    clickedRow = $.trim(clickedRow);
                    clickedRowType = $(this).parent().next().attr('row-type');
                }

            } else {
                if ($(this).hasClass('archiveChecks')){
                    $('#activateDocument').hide();
                } else {
                    $('#editDocument').hide();
                    disableCheckboxes();
                }
            }
        });

        $('body').on("click",'.item-row', function(){
            prevName = currentName;
            prevParent = parent;
            currentName = $(this).text().trim();
            parent = $(this).attr('id');
            docType = $(this).attr('row-type')
            if (docType === 'folder'){
              getDocuments();
              getBreadcrumbs();
            } else {
              getRevisions();
              getBreadcrumbs();
            }

        });

        $('body').on("click",'.previous-breadcrumb', function(){
            parent = $(this).attr('id');
            currentName = prevName;
            if (parent === "0"){
              prevName = "Home";
              getBreadcrumbs();
              getDocuments();
            } else {
              $.ajax({
                  url: "http://localhost:3000/v1/folders/"+parent,
                  method: "GET",
                  dataType: 'json',
                  headers: { "Auth": token },
                  contentType: "application/json",
                   success: function(result,status,jqXHR ){
                      getDocuments();
                   },
                   error(jqXHR, textStatus, errorThrown){
                     console.log(errorThrown);
                   },
                   complete: function (result,status,jqXHR ) {
                     prevParent = result.responseJSON[0].parent;
                     if (prevParent !== 0) {
                       $.ajax({
                           url: "http://localhost:3000/v1/folders/"+prevParent,
                           method: "GET",
                           dataType: 'json',
                           headers: { "Auth": token },
                           contentType: "application/json",
                            success: function(result,status,jqXHR ){

                            },
                            error(jqXHR, textStatus, errorThrown){
                              console.log(errorThrown);
                            },
                            complete: function (result,status,jqXHR ) {


                              prevName = result.responseJSON[0].name;
                              getBreadcrumbs();

                            }
                         });
                     } else {
                       prevName = "Home";
                       getBreadcrumbs();
                     }

                   }
                });
            }

            });

        $('#renameButton').click(function () {
            $('#renameTitle').text('Rename '+ clickedRowType);
            $('#renameModal').modal('show');
            $('#renameName').val(clickedRow);
            $('#editDocument').hide();
        });

        $('#deleteButton').click(function () {
            $('#deleteTitle').text('Are you sure you want to delete: ' + clickedRow + '?');
            $('#deleteModal p').hide();
            $('#'+clickedRowType + 'Warning').show();
            $('#deleteModal').modal('show');
            $('#editDocument').hide();
        });

        $('#activateButton').click(function () {
            var ids = $('.archiveChecks:checkbox:checked');
            if (ids.length > 0){
                var async_request=[];
                var responses=[];
                var body = {};
                body.status = true;
                body = JSON.stringify(body);
                for (id=0; id<ids.length;id++){
                    var currentId = $(ids[id]).parent().next().attr('id');

                    async_request.push($.ajax({
                        url:"http://localhost:3000/v1/documents/"+currentId, // your url
                        method:'put',
                        dataType: 'json',
                        data: body,
                        headers: { "Auth": token },
                        contentType: "application/json",
                        success: function(data){
                            console.log('success of ajax response')
                            responses.push(data);
                        }
                    }));
                }
                $.when.apply(null, async_request).done( function(){
                    // all done
                    console.log('all request completed')
                    console.log(responses);
                    getArchives();
                });

            } else {
                $('#alert').html('<div class="alert alert-danger alert-dismissable">' +
                    '<a href="#" class="close" data-dismiss="alert" aria-label="close">×</a>' +
                    '<strong>No Document Selected:</strong> Please check the boxes of the documents you want to activate' +
                    '</div>')
            }



        });

        $('#searchButton').click(function () {
            var searchText = $('#searchText').val();
            $('#searchText').val('');
            if (searchText !== ''){
                getDocuments(searchText)
            }
        });

    //FUNCTIONS

        addDocument = function () {
            var body = {}
            body.name = $('#documentName').val();
            body.parent = parent;
            body = JSON.stringify(body);

            $('#documentName').val('');

            $.ajax({
                url: "http://localhost:3000/v1/documents",
                method: "POST",
                data: body,
                dataType: 'json',
                headers: { "Auth": token },
                contentType: "application/json",
                 success: function(result,status,jqXHR ){
                      getDocuments();
                 },
                 error(jqXHR, textStatus, errorThrown){
                     console.log(errorThrown);
                 }
            });
        };
        addFolder = function () {
            var body = {}
            body.name = $('#folderName').val();
            body.parent = parent;
            body = JSON.stringify(body);;

            $('#folderName').val('');

            $.ajax({
                url: "http://localhost:3000/v1/folders",
                method: "POST",
                data: body,
                dataType: 'json',
                headers: { "Auth": token },
                contentType: "application/json",
                 success: function(result,status,jqXHR ){
                      getDocuments();
                 },
                 error(jqXHR, textStatus, errorThrown){
                     console.log(errorThrown);
                 }
            });
        };

        addRevision = function () {

            var body = {}
            body.name = $('#revisionName').val().toString();
            $('#revisionName').val('');
            console.log(body);
            body = JSON.stringify(body);
            $.ajax({
                url: "http://localhost:3000/v1/revisions/"+parent,
                method: "POST",
                data: body,
                dataType: 'json',
                headers: { "Auth": token},
                contentType: "application/json",
                 success: function(result,status,jqXHR ){
                      getRevisions();
                 },
                 error(jqXHR, textStatus, errorThrown) {
                     $("#login-error").text('Incorrect email or password');
                 }
            });
            getRevisions();
        };

        getDocuments = function (){
            $('#revisionHeading').hide();
            $('.document-pill').show();
            $('.revision-pill').hide();
            var rows = '<div class="col-xs-12" id="documentbar">';
            if (parent === "0"){
              $('.sad').html('')
            }
            $.ajax({
                url: "http://localhost:3000/v1/folders/parent/"+parent,
                method: "GET",
                dataType: 'json',
                headers: { "Auth": token },
                contentType: "application/json",
                 success: function(result,status,jqXHR ){
                      result.forEach(function (folder) {
                        rows += '<div class="row item sortable">\
                                <div class="col checkbox">\
                                    <input type="checkbox" class="form-check-input" style="display: none;">\
                                </div>\
                                <div class="item-row" id="'+folder.id+'" row-type="folder">\
                                    <img class="img-responsive icon" src="/revisioncheck2/assets/img/folder.png">'+folder.name+'</div>\
                                 </div>';
                      });

                 },
                 error(jqXHR, textStatus, errorThrown){
                   console.log(errorThrown);
                 },
                 complete: function (){
                   $.ajax({
                       url: "http://localhost:3000/v1/documents/parent/"+parent,
                       method: "GET",
                       dataType: 'json',
                       headers: { "Auth": token },
                       contentType: "application/json",
                        success: function(result,status,jqXHR ){
                            result.forEach(function (documents) {
                              rows += '<div class="row item sortable">\
                                      <div class="col checkbox">\
                                          <input type="checkbox" class="form-check-input" style="display: none;">\
                                      </div>\
                                      <div class="item-row" id="'+documents.id+'" row-type="document">\
                                          <img class="img-responsive icon" src="/revisioncheck2/assets/img/document.png">\
                                          '+documents.name+'</div>\
                                       </div>';
                            });
                            rows += '</div>';
                            $('#documentrow').html(rows);
                           makeDroppable();

                        },
                        error(jqXHR, textStatus, errorThrown){
                          console.log(errorThrown);
                        }
                   });
                 }
            });



        };

        getRevisions = function () {
            var rows = '<div class="col-xs-12" id="documentbar">\
            <div class="row">\
                <div class="col-xs-12" id="revisionHeading">\
                    <div class="col-xs-5">Revision</div>\
                    <div class="col-xs-3" style="text-align: center">Rev Code</div>\
                    <div class="col-xs-3" style="text-align: center">QR Code</div>\
                    <div class="col-xs-1" style="text-align: center">Status</div>\
                </div>\
            </div>';
            $('#revisionHeading').show();
            $('#documentHeading').hide();

            $('.document-pill').hide();
            $('.revision-pill').show();
          $.ajax({
              url: "http://localhost:3000/v1/revisions/"+parent,
              method: "GET",
              dataType: 'json',
              headers: { "Auth": token },
              contentType: "application/json",
               success: function(result,status,jqXHR ){
                   result.forEach(function (revision) {
                     var latest = 'old';
                     if (revision.latest === true) {
                       latest = 'latest';
                     }
                     rows += '        <div class="row sortable" id="%s">\
                                       <div class="col-xs-12 rev-item">\
                                           <div class="col-xs-5">\
                                              <p class="textItem revisionText">'+revision.name+'</p>\
                                           </div>\
                                           <div class="col-xs-3">\
                                              <p class="textItem" style="text-align: center">'+revision.uniqueCode+'</p>\
                                           </div>\
                                           <div class="col-xs-3">\
                                              <p class="textItem downloadQR" id="'+revision.id+'" style="text-align: center">View</p>\
                                           </div>\
                                           <div class="col-xs-1">\
                                              <img class="img-responsive rev-icon" src="https://revisioncheck.com/assets/img/'+latest+'.png">\
                                           </div>\
                                       </div>\
                                   </div>';
                   });
                   rows += '</div>';
                   $('#documentrow').html(rows);
                   $('#revisionHeading').show();
                   $('#documentHeading').hide();

                   $('.document-pill').hide();
                   $('.revision-pill').show();


               },
               error(jqXHR, textStatus, errorThrown){
                 console.log(errorThrown);
               }
          });

        };

        getBreadcrumbs = function () {
          $('#back').html('<ol class="breadcrumb">\
              <li class="breadcrumb-item previous-breadcrumb" id="'+prevParent+'"><a class="sad">'+prevName+'</a></li>\
              <li class="breadcrumb-item active" id="currentBread">'+currentName+'</li>\
          </ol>');

        }

        getArchives = function (){
          var rows = '<div class="col-xs-12" id="documentbar">';
          if (parent === "0"){
            $('.sad').html('')
          }

          $.ajax({
             url: "http://localhost:3000/v1/archives",
             method: "GET",
             dataType: 'json',
             headers: { "Auth": token },
             contentType: "application/json",
              success: function(result,status,jqXHR ){
                  result.forEach(function (documents) {
                    rows += '<div class="row item sortable">\
                            <div class="col checkbox">\
                                <input type="checkbox" class="form-check-input archiveChecks" style="display: none;">\
                            </div>\
                            <div class="" id="'+documents.id+'" row-type="archive">\
                                <img class="img-responsive icon" src="/revisioncheck2/assets/img/archive.png">\
                                '+documents.name+'</div>\
                             </div>';
                  });
                  rows += '</div>';
                  $('#documentrow').html(rows);
                 makeDroppable();

              },
              error(jqXHR, textStatus, errorThrown){
                console.log(errorThrown);
              }
          });

        };

        getArchives();

        searchDocuments = function (searchTerm) {
          $('#revisionHeading').hide();
          $('.document-pill').show();
          $('.revision-pill').hide();
          var rows = '<div class="col-xs-12" id="documentbar">';

          $.ajax({
              url: "http://localhost:3000/v1/folders/search/"+searchTerm,
              method: "GET",
              dataType: 'json',
              headers: { "Auth": token },
              contentType: "application/json",
               success: function(result,status,jqXHR ){
                    result.forEach(function (folder) {
                      rows += '<div class="row item sortable">\
                              <div class="col checkbox">\
                                  <input type="checkbox" class="form-check-input" style="display: none;">\
                              </div>\
                              <div class="item-row" id="'+folder.id+'" row-type="folder">\
                                  <img class="img-responsive icon" src="/revisioncheck2/assets/img/folder.png">'+folder.name+'</div>\
                               </div>';
                    });

               },
               error(jqXHR, textStatus, errorThrown){
                 console.log(errorThrown);
               },
               complete: function (){
                 $.ajax({
                     url: "http://localhost:3000/v1/documents/search/"+searchTerm,
                     method: "GET",
                     dataType: 'json',
                     headers: { "Auth": token },
                     contentType: "application/json",
                      success: function(result,status,jqXHR ){
                          result.forEach(function (documents) {
                            rows += '<div class="row item sortable">\
                                    <div class="col checkbox">\
                                        <input type="checkbox" class="form-check-input" style="display: none;">\
                                    </div>\
                                    <div class="item-row" id="'+documents.id+'" row-type="document">\
                                        <img class="img-responsive icon" src="/revisioncheck2/assets/img/document.png">\
                                        '+documents.name+'</div>\
                                     </div>';
                          });
                          rows += '</div>';
                          $('#documentrow').html(rows);
                         makeDroppable();

                      },
                      error(jqXHR, textStatus, errorThrown){
                        console.log(errorThrown);
                      }
                 });
               }
          });
        }

        renameDocuments = function (){
            var body = {};
            body.name = $('#renameName').val();
            body = JSON.stringify(body);

            if (clickedRowType == 'folder'){
              $.ajax({
                  url: "http://localhost:3000/v1/folders/" + clickedId,
                  method: "PUT",
                  data: body,
                  dataType: 'json',
                  headers: { "Auth": token },
                  contentType: "application/json",
                   success: function(result,status,jqXHR ){
                      console.log(result);
                      getDocuments();
                   },
                   error(jqXHR, textStatus, errorThrown){
                     console.log(errorThrown);
                   }
              });
            } else {
              $.ajax({
                  url: "http://localhost:3000/v1/documents/" + clickedId,
                  method: "PUT",
                  data: body,
                  dataType: 'json',
                  headers: { "Auth": token },
                  contentType: "application/json",
                   success: function(result,status,jqXHR ){
                      console.log(result);
                      getDocuments();
                   },
                   error(jqXHR, textStatus, errorThrown){
                     console.log(errorThrown);
                   }
              });
            }

        };

        deleteDocuments = function (){
          var parentId = []
          if (clickedRowType == "folder"){
            $.ajax({
                url: "http://localhost:3000/v1/folders/children/"+clickedId,
                method: "POST",
                dataType: 'json',
                headers: { "Auth": token },
                contentType: "application/json",
                 success: function(result,status,jqXHR ){
                   console.log("success result: ", result);
                 },
                 error(jqXHR, textStatus, errorThrown){
                   console.log(errorThrown);
                 },
                 complete: function (result){
                  var ids = result.responseJSON;
                  var async_request=[];
                  var responses=[];
                  for(id in ids)
                  {
                      console.log("id: ", ids[id]);
                      // you can push  any aysnc method handler
                      async_request.push($.ajax({
                          url:"http://localhost:3000/v1/folders/"+ids[id], // your url
                          method:'delete',
                          dataType: 'json',
                          headers: { "Auth": token },
                          contentType: "application/json",
                          success: function(data){
                              console.log('success of ajax response')
                              responses.push(data);
                          }
                      }));
                      async_request.push($.ajax({
                          url:"http://localhost:3000/v1/documents/parent/"+ids[id], // your url
                          method:'put',
                          dataType: 'json',
                          headers: { "Auth": token },
                          contentType: "application/json",
                          success: function(data){
                              console.log('success of ajax response')
                              responses.push(data);
                          }
                      }));
                  }

                  $.when.apply(null, async_request).done( function(){
                      // all done
                      console.log('all request completed')
                      console.log(responses);
                      getDocuments();
                  });



                 }
              });
          } else {
            var body = {};
            body.status = false;
            body = JSON.stringify(body);
            $.ajax({
                url: "http://localhost:3000/v1/documents/" + clickedId,
                method: "PUT",
                data: body,
                dataType: 'json',
                headers: { "Auth": token },
                contentType: "application/json",
                 success: function(result,status,jqXHR ){
                    console.log(result);
                    getDocuments();
                 },
                 error(jqXHR, textStatus, errorThrown){
                   console.log(errorThrown);
                 }
            });
          }

        };



    //DIPLAYED SERVER CONTENT



        //Allow user to drag item into breadcrumb to move back a folder
        $("#back").droppable({
            over: function(event, ui) {
                $(this).addClass("highlighter_focus_in");
            },
            out: function(event, ui) {
                $(this).removeClass("highlighter_focus_in");
            },
            drop: function( event, ui ) {
                var drag = $(ui.draggable).attr("id");
                var dragType = $(ui.draggable).attr("row-type");
                var drop = $('#previousBread').find('a').attr('id');
                var body = {};
                body.parent = drop;
                body = JSON.stringify(body);
                $(this).removeClass("highlighter_focus_in");
                console.log(drop);
                console.log(dragType);
                $.ajax({
                    url: "http://localhost:3000/v1/"+dragType+"s/" + drag,
                    method: "PUT",
                    data: body,
                    dataType: 'json',
                    headers: { "Auth": token },
                    contentType: "application/json",
                     success: function(result,status,jqXHR ){
                        console.log(result);
                        getDocuments();
                     },
                     error(jqXHR, textStatus, errorThrown){
                       console.log(errorThrown);
                     }
                });

            }

        });

        //Navigate to new parent on row click

        //View QR
        $('body').on("click",'.downloadQR', function(){
            revCode = $(this).attr('id');
            $('#qrHeading').text('Rev Code: ' + revCode);
            $('#qrcode').html('').qrcode(revCode);
            $('#qrModal').modal();

        //     console.log(revCode);
        // $.post('functions/workspace/getQR.php', {revCode: revCode}, function (data) {
        //     console.log(data)
        //
        // });

        });

    //QR Code



        //Download QR Code Button

        function downloadCanvas(link, canvasId, filename) {
            link.href = document.getElementById(canvasId).toDataURL();
            link.download = filename;

        }

        /**
         * The event handler for the link's onclick event. We give THIS as a
         * parameter (=the link element), ID of the canvas and a filename.
         */
        document.getElementById('qrButton').addEventListener('click', function() {
            downloadCanvas(this, 'qrCanvas', revCode + '.png');
        }, false);


    (function($) {
        var $window = $(window),
            $html = $('#search-bar nav');

        function resize() {
            if ($window.width() > 787) {
                $('#search-bar').show()
            } else {
                $('#search-bar').hide()

            }
        }

        $window
            .resize(resize)
            .trigger('resize');
    })(jQuery);

    $('.active').addClass('blue')



});