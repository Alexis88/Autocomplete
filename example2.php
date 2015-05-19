<?php
$connection = new mysqli('server', 'user', 'password', 'bd_name');

if ($connection->connect_error) exit ('Could not connect to the server');

$term = $connection->real_escape_string(strip_tags(trim($_GET['term'])));
$query = "SELECT city_name FROM cities WHERE city_name LIKE '%{$term}%'";
$result = $connection->query($query) or exit ('Could not execute the query');
$response = [];

if ($result->num_rows){
	while ($row = $result->fetch_array()){
		$response[] = $row['city_name'];
	}
	$result->free();
}

$connection->close();
echo json_encode($response);
?>
