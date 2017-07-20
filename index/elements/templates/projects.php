<div class="container">
	<div class="preview">
		<a rel="noreferrer" href="<?= "/projects/" . url($row["title"]) . ".php"; ?>">
			<img src="index/assets/images/thumbnails/<?= $row["thumbnail"]; ?>"/>
			<span>
				<div class="tags">
					<h3><?= $row["title"]; ?></h3>
					<p><?= $row["type"]; ?></p>
				</div>
			</span>
		</a>
	</div>
</div>
