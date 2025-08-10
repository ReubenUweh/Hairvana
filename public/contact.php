<pre>
<?php
require_once "../env.php";
require_once "../phpMailer/src/PHPMailer.php";
require_once "../phpMailer/src/SMTP.php";

function sendEmail($name, $email, $body)
{

    $host = EMAIL_HOST;
    $username = EMAIL_USERNAME;
    $password = EMAIL_PASSWORD;
    $port = EMAIL_PORT;

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
    $mail->addAddress("reubenjunior34@gmail.com"); #sales@hairvanabyHoR.com
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