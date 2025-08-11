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


    $mail = new PHPMailer(true);
    try {
        //Server settings
        $mail->SMTPDebug = SMTP::DEBUG_OFF;                      //Enable verbose debug output
        $mail->isSMTP();                                            //Send using SMTP
        $mail->Host       = $host;                     //Set the SMTP server to send through
        $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
        $mail->Username   = $username;                     //SMTP username
        $mail->Password   = $password;                               //SMTP password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;           //Enable implicit TLS encryption
        $mail->Port       = $port;                                    //TCP port to connect to; use 587 if you have set SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS

        //Recipients
        $mail->setFrom(EMAIL_USERNAME, 'Hairvana');
        $mail->addAddress("reubenjunior34@gmail.com", "Joe User");

        //Content
        $mail->isHTML(true);                                  //Set email format to HTML
        $mail->Subject = "New Message";
        $mail->Body    = $body;
        $mail->AltBody = $body;
;
        $mail->send();
        echo 'Message has been sent';
    } catch (Exception $e) {
        echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
        return header("location:index.html");
    }
}
$name = $_POST['name'];
$email = $_POST['email'];
$phone = $_POST['phone'];
$message = $_POST['message'];

$body = "
<h3 style='text-align: left;'>$name</h3>
<p>Hey Hairvana,</p>
<p>$message</p>
<p>My Phone Number: $phone</p>
<p>My Email: $email</p>
<p>Thanks.</p>
";


sendEmail($name, $email, $body);
print_r($body);
?>