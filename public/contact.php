<?php
// use PHPMailer\PHPMailer\PHPMailer;

if(isset($_POST['name']) && isset($_POST['email'])){
    $name = $_POST['name'];
    $email = $_POST['email'];
    $phone = $_POST['phone'];
    // $subject = $_POST['subject'];
    $body = $_POST['message'];

    require_once "../phpMailer/src/PHPMailer.php";
    require_once "../phpMailer/src/SMTP.php";
    // require_once "../phpMailer/src/Exception.php";

    $mail = new PHPMailer();
    //Server settings
    $host = "smtp-reuben-uweh.alwaysdata.net";
    $username = "reuben-uweh@alwaysdata.net";
    $password = "Rairai206";
    $port = "465"; // or 587 for TLS

    //smtp settings
    $mail->isSMTP();
    $mail->Host = $host;
    $mail->SMTPAuth = true;
    $mail->Username = $username;
    $mail->Password = $password;
    $mail->Port = $port;
    $mail->SMTPSecure = "ssl";

    //email settings
    $mail->isHTML(true);
    $mail->setFrom($email, $name);
    $mail->addAddress("streamclips034@gmail.com"); #sales@hairvanabyHoR.com
    // $mail->Subject = ("$email ($subject)");
    $mail->Body = $body;

    if($mail->send()){
        $status = "success";
        $response = "Email is sent!";
    }
    else
    {
        $status = "failed";
        $response = "Something is wrong: <br>" . $mail->ErrorInfo;
    }

    exit(json_encode(array("status" => $status, "response" => $response)));
}

?>