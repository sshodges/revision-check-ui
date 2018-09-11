<?php
include_once("functions/db.php");

session_start();

if(!isset($_SESSION['idd'])){
    header("Location: ../login");
} else {
    $userId = $_SESSION['idd'];
}

$result = $db->query("SELECT * FROM accounts WHERE id='$userId'");
if ($result->num_rows > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        $first = $row['first_name'];
        $last = $row['last_name'];
        $company = $row['company'];
    }
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Workspace - THW</title>
    <link rel="stylesheet" href="https://revisioncheck.com/assets/css/bootstrap/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
    <script src="https://revisioncheck.com/assets/css/bootstrap/bootstrap.js"></script>
    <link href='https://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="/revisioncheck2/assets/css/app.css">
    <link rel="stylesheet" href="/revisioncheck2/assets/css/myaccount.css">
    <link rel="stylesheet" href="/revisioncheck2/assets/css/font-awesome-4.7.0/css/font-awesome.min.css">
    <script type="text/javascript" src="https://revisioncheck.com/assets/js/jquery.qrcode.min.js"></script>
</head>
<body>
<div id="alert"></div>

<div id="left-bar" class="col-sm-3">
    <a id="brand"><img src="/revisioncheck2/assets/img/logo.png" class="logo"></a>
    <ul class="" id="left-nav">
        <li><a href="app/home">Home</a></li>
        <li><a href="archive">Archive</a></li>
        <li><a class="active" href="myaccount">My Account</a></li>
        <li id="logout" class=""><a href="logout">Logout</a></li>
    </ul>
</div>
<div id="right-bar" class="col-sm-9">

    <div id="content-bar" class="row">
        <div id="container">
            <div class="row item-account">
                <div class="col-xs-3">
                    <h5>Name</h5>
                </div>
                <div class="col-xs-9 right">
                    <h5><?php echo $first . ' '. $last; ?> <a class="edit" id="name"> Edit</a></h5>
                </div>
            </div>
            <hr>
            <div class="row item-account">
                <div class="col-xs-3">
                    <h5>Company</h5>
                </div>
                <div class="col-xs-9 right">
                    <h5><?php echo $company; ?><a class="edit" id="company"> Edit</a></h5>
                </div>
            </div>
            <hr>
            <div id="passwordButtonDiv">
                <div id="passwordButton" class="btn btn-default" onclick="$('#passwordModal').modal('show');">Change Password</div>
            </div>



            <div class="modal fade" id="nameModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            <div class="inputHolder">
                                <input id="firstName" type="text" placeholder="First Name" autocomplete="off">
                            </div>
                            <div class="inputHolder">
                                <input id="lastName" type="text" placeholder="Last Name" autocomplete="off">
                            </div>
                        </div>
                        <div class="buttonHolder">
                            <button type="button" class="btn btn-primary" id="changeName">Change</button>
                            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="companyModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            <div class="inputHolder">
                                <input id="companyName" type="text" placeholder="Company Name" autocomplete="off">
                            </div>
                        </div>
                        <div class="buttonHolder">
                            <button type="button" class="btn btn-primary" id="changeCompany">Change</button>
                            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="passwordModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            <div class="inputHolder">
                                <input id="oldPassword" type="password" placeholder="Current Password">
                            </div>
                            <div class="inputHolder">
                                <input id="newPassword" type="password" placeholder="New Password"">
                            </div>
                            <div class="inputHolder">
                                <input id="confirmPassword" type="password" placeholder="Confirm New Password"">
                            </div>
                            <div id="change-error"></div>
                        </div>
                        <div class="buttonHolder">
                            <button type="button" class="btn btn-primary" id="changePassword">Change</button>
                            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>

    </div>

</div>

<div id="qrModal" class="modal fade" role="dialog">
    <div class="modal-dialog">

        <!-- Modal content-->
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title" id="qrHeading"></h4>
            </div>
            <div class="modal-body">
                <div id="qrcode"></div>
            </div>
            <a class="btn btn-success" id="qrButton">Download</a>
        </div>

    </div>
</div>



<script type="application/javascript">
    <?php
    echo 'var userId='.$userId . ';';
    ?>
</script>
<script src="/revisioncheck2/assets/js/myaccount.js"></script>


</body>
</html>