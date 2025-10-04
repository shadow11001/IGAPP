#Requires AutoHotkey v2.0

;Functions

;GetTime := FormatTime(, "M/d/yyyy h:mm tt")

;AutoCorrect

::btw::by the way

;Common Phrases and Statements

::.gm::Good Morning
::.ga::Good Afternoon
::.ge::Good Evening
::.c::Please see the screenshot(s) below:
::.s::Thank you for contacting Walmart Digital Assets{!}
::.pn::PHONE_PLACEHOLDER
::.spn::PHONE_PLACEHOLDER
::.iemail::USER_EMAIL_PLACEHOLDER
::.wemail::USER_EMAIL_PLACEHOLDER
::.mc::URL_PLACEHOLDER


;WO Notes
::.on::Logged into Novar.
::.oa::Logged into Opus Arch.
::.om::Logged into Opus Mag.
::.em::Logged into CPC.
::.daka::Logged into Danfoss AKA65.
::.dsvd::Logged into Danfoss Storeview.
::.cc::Checked comms.
::.cl::Checked comms. Still in comm loss.
::.ct::Checked temps.
::.df::Forced defrost on 
::.tf::Terminated Defrost.
::.ca::Checked alarms.
::.ccl::Checked clocks.
::.dlv::Performed Version Download.
::.dllc::Performed Load Change Download.
::.dlcl::Performed Comms and Load Change Download.
::.dlml::Performed Main and Load Change Download.
::.dlmcl::Performed Main, Comms, and Load Change Download.
::.ag::All good.
::.ng::No good.
::.tts::Tech will troubleshoot.
::.cd::Call dropped.
::.nsrm::Tech called for a suppression. Adv tech of NSRM email.
::.fo::Forced on 
::.lts::lights
::.folts::Forced on lights.
::.p::Pinged controller.
::.pr::Receiving good ping.
::.pt::Ping timedout.
::.pc::Adv tech to power cycle controller.
::.na::Tech no longer needed assistance.
::.rc::Reset clocks.

;AutoStart

^+!m::
{
Run "C:\Program Files (x86)\UltraSite32\wm_us_getdb.bat", "C:\Program Files (x86)\UltraSite32\"
}

^+!n::
{
Run "C:\Program Files\Microsoft Office\root\Office16\ONENOTE.EXE"
Run "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe", "C:\Program Files (x86)\Google\Chrome\Application"
Run "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe", "C:\Program Files (x86)\Google\Chrome\Application"
Run "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe", "C:\Program Files (x86)\Google\Chrome\Application"
;Run "C:\Program Files (x86)\Danfoss\WM_Get_Danfoss_Contacts.bat > WM_Get_Danfoss_Contact.log.txt", "C:\Program Files (x86)\Danfoss"
Run "L:\fm_apps\fm_ping\fm_ping.exe", "L:\fm_apps\fm_ping"
}

;Logins

::.login::USER_ID_PLACEHOLDER{Tab}PASSWORD_PLACEHOLDER{Enter}
::.pw::PASSWORD_PLACEHOLDER
::.cpc::homeoffice\USER_ID_PLACEHOLDER{Tab}PASSWORD_PLACEHOLDER{Enter}
::.sv::USER_ID_PLACEHOLDER{Tab}PASSWORD_PLACEHOLDER{Enter}
::.opa::URL_PLACEHOLDER
::.opm::URL_PLACEHOLDER
::.boss::USER_ID_PLACEHOLDER{Tab}PASSWORD_PLACEHOLDER{Enter}
::.homeoffice::USER_EMAIL_PLACEHOLDER
::.maga::URL_PLACEHOLDER

;Tech Tracker
::.tt::USER_ID_PLACEHOLDER{Tab}HARDWARE_ID_PLACEHOLDER{Tab}

;Templates

::.hd::
(
Site:
EMS:
WO:
Issue:
What have you done:
Any Screenshots/Wiki Links(Add at the End)
)

::.dae1::
(
Name: 
Phone: 
Email: 
Store: 
Rack: 
EMS: 
Request and Reason: 
)

::.dae3::
(
Store:
Detailed error:
Task ID:
Tech Name and Number:
Screenshots:
)

::.dae4::
(
Tech Name: 
Tech Phone Number: 
Tech Email: 
Store: 
Device Type and Location: 
MAC Address: 
)

::.dae5::
(
Tech Name: 
Tech Phone Number: 
Tech Email: 
Store: 
EMS: 
Ethernet Plugged in?:
Controller Type:
Rack:
Power Cycled?:
Functioning Normally?: 
MAC Address:
)

::.dae6::
(
Tech Name: 
Tech Phone Number: 
Tech Email: 
Store: 
Rack:
Current Mod Address and Point:
New Mod Address and Point:
)

::.dae8::
(
Tech Name: 
Phone: 
Email: 
Store: 
Download:
Rack:
Description:
)

::.dae10::
(
Permission given: 
Tech Name: 
Phone: 
Email: 
Store: 
Issue: 
What have you done: 
)

::.dae12::
(
Tech Name:  
Tech Phone Number:
Tech Email:
Store:
Rack:
EMS: 
Request and Reason:
VCC Master ID:
)

::.pcr::
(
Store:
Rack:
Name of Asset
Type of Board:
Bad Point:
New or Same Board:
New Point:
Tech's First Name and Phone Number:
)

::.war::
(
*Site 4
Verified in Carel Boss:

LTA: No Alarms
LTB: No Alarms
MTC: No Alarms
MTD: No Alarms
RCU: No Alarms

 
*Site 5152
Verified in CPC:

CKTS - 

Open WorkOrders:

Site 4 - None

Site 5152 - None
)

::.mm::
(
Master Mind Report Notes Show: 

Please Email acserv@wal-mart.com when service is complete. Please provide notes regarding work done along with on/off site date and times. You may also contact Alarm Central at 479-273-4600, options 1 and 4 between the hours of 7AM-7PM CST Mon-Fri
)

;Email

::.emaildefrost::
(
The defrost you have requested for store [STORE NUMBER],[CASE NUMBER] has been completed. Please see screenshot below:
)

::.emailpdr::
(
The request you have made is outside of the Walmart Parameters and requires a Parameter Deviation Request (PDR). Your request has been submitted. A member of our team will reach out to you as soon as your request has been reviewed and is approved or denied.
)

::.emailpcr::
(
The request you have made requires a Point Change Request. Your request has been submitted.
A member of our team will reach out as soon as your request has been completed.
)

::.emailpcn::
(
The request you have made requires more information. Please provide the best contact number for reaching you.
A member of our team will reach out via phone as soon as possible.
)

::.emaildae::
(
The request you have made requires a Digital Assets Escalation. Your request has been escalated. Your work order number is: 
)

::.nc::
{
    GetTime := FormatTime(, "M/d/yyyy h:mm tt")
    SendInput GetTime
    SendInput "{Enter}Name: {Enter}Site: {Enter}WO: {Enter}Issue: {Enter}What have you done: "
}

::.ne::
{
    GetTime := FormatTime(, "M/d/yyyy h:mm tt")
    SendInput GetTime
    SendInput "{Enter}Name: {Enter}Site: {Enter}WO: {Enter}Issue: {Enter}What have you done: "
}

