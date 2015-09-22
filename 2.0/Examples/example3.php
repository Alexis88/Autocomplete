<?php
$connection = new mysqli('server', 'user', 'password', 'db_name');

if ($connection->connect_error) exit ('Could not connect to the server');

$term = $connection->real_escape_string(strip_tags(trim($_GET['term'])));
$query = "SELECT * FROM clients WHERE cli_name LIKE '%{$term}%'";
$result = $connection->query($query) or exit ('Could not execute the query');
$response = [];

if ($result->num_rows){
	while ($row = $result->fetch_array()){
		$response[] = ['id' => $row['cli_id'], 'name' => $row['cli_name']];
	}
	$result->free();
}

$connection->close();
echo json_encode($response);
?>
