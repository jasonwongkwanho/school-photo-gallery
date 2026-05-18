function doGet(e) {
  const token = e.parameter.token || "";
  const action = e.parameter.action || "albums";

  const expectedToken = PropertiesService
    .getScriptProperties()
    .getProperty("API_SECRET");

  if (token !== expectedToken) {
    return jsonOutput({ ok: false, error: "Unauthorized" });
  }

  try {
    if (action === "albums") {
      return listAlbums();
    }

    if (action === "photos") {
      return listPhotosByAlbum(e.parameter.albumId);
    }

    if (action === "latest") {
      return listLatestPhotos(e.parameter.limit || 24);
    }

    if (action === "list") {
      return listLatestPhotos(e.parameter.limit || 24);
    }

    return jsonOutput({ ok: false, error: "Unknown action" });
  } catch (error) {
    return jsonOutput({ ok: false, error: error.message });
  }
}

function listAlbums() {
  const albums = getPublishedAlbums_();

  const result = albums.map(function(album) {
    const photos = getImagesFromFolder_(album.folderId);
    const latestPhoto = photos[0] || null;

    return {
      id: album.albumId,
      albumId: album.albumId,
      title: album.title,
      folderId: album.folderId,
      category: album.category,
      dateText: album.dateText,
      description: album.description,
      coverFileId: album.coverFileId,
      coverUrl: album.coverFileId
        ? makeThumbnailUrl_(album.coverFileId)
        : latestPhoto
          ? latestPhoto.thumbnailUrl
          : "",
      photoCount: photos.length,
      latestUpdated: latestPhoto ? latestPhoto.updatedAt : "",
      sortOrder: album.sortOrder,
      featured: album.featured
    };
  });

  result.sort(function(a, b) {
    return Number(a.sortOrder || 999) - Number(b.sortOrder || 999);
  });

  return jsonOutput({ ok: true, count: result.length, albums: result });
}

function listPhotosByAlbum(albumId) {
  if (!albumId) {
    return jsonOutput({ ok: false, error: "Missing albumId" });
  }

  const albums = getPublishedAlbums_();
  const album = albums.find(function(item) {
    return item.albumId === albumId;
  });

  if (!album) {
    return jsonOutput({ ok: false, error: "Album not found" });
  }

  const photos = getImagesFromFolder_(album.folderId);

  return jsonOutput({
    ok: true,
    album: {
      id: album.albumId,
      albumId: album.albumId,
      title: album.title,
      category: album.category,
      dateText: album.dateText,
      description: album.description
    },
    count: photos.length,
    photos: photos
  });
}

function listLatestPhotos(limit) {
  const albums = getPublishedAlbums_();
  let allPhotos = [];

  albums.forEach(function(album) {
    const photos = getImagesFromFolder_(album.folderId).map(function(photo) {
      return Object.assign({}, photo, {
        albumId: album.albumId,
        albumTitle: album.title,
        category: album.category
      });
    });

    allPhotos = allPhotos.concat(photos);
  });

  allPhotos.sort(function(a, b) {
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  const max = Math.max(1, Number(limit) || 24);

  return jsonOutput({
    ok: true,
    count: allPhotos.length,
    photos: allPhotos.slice(0, max)
  });
}

function getPublishedAlbums_() {
  const props = PropertiesService.getScriptProperties();
  const sheetId = props.getProperty("ALBUM_SHEET_ID");
  const sheetName = props.getProperty("ALBUM_SHEET_NAME") || "Albums";

  if (!sheetId) {
    throw new Error("Missing ALBUM_SHEET_ID");
  }

  const ss = SpreadsheetApp.openById(sheetId);
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error("Cannot find sheet: " + sheetName);
  }

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) return [];

  const headers = values[0].map(function(h) {
    return String(h).trim();
  });

  const idx = function(name) {
    return headers.indexOf(name);
  };

  const requiredHeaders = [
    "albumId",
    "title",
    "folderId",
    "category",
    "dateText",
    "description",
    "coverFileId",
    "published",
    "sortOrder"
  ];

  requiredHeaders.forEach(function(header) {
    if (idx(header) === -1) {
      throw new Error("Missing column: " + header);
    }
  });

  return values.slice(1)
    .map(function(row) {
      return {
        albumId: String(row[idx("albumId")] || "").trim(),
        title: String(row[idx("title")] || "").trim(),
        folderId: String(row[idx("folderId")] || "").trim(),
        category: String(row[idx("category")] || "").trim(),
        dateText: String(row[idx("dateText")] || "").trim(),
        description: String(row[idx("description")] || "").trim(),
        coverFileId: String(row[idx("coverFileId")] || "").trim(),
        published: String(row[idx("published")] || "").trim().toUpperCase(),
        sortOrder: row[idx("sortOrder")],
        featured: idx("featured") >= 0 ? String(row[idx("featured")] || "").trim().toUpperCase() : "FALSE"
      };
    })
    .filter(function(album) {
      return album.albumId && album.title && album.folderId && album.published === "TRUE";
    });
}

function getImagesFromFolder_(folderId) {
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFiles();
  const photos = [];

  while (files.hasNext()) {
    const file = files.next();
    const mimeType = file.getMimeType();

    if (!mimeType.startsWith("image/")) continue;

    const fileId = file.getId();

    photos.push({
      id: fileId,
      name: file.getName(),
      mimeType: mimeType,
      createdAt: file.getDateCreated().toISOString(),
      updatedAt: file.getLastUpdated().toISOString(),
      thumbnailUrl: makeThumbnailUrl_(fileId),
      viewUrl: "https://drive.google.com/file/d/" + fileId + "/view"
    });
  }

  photos.sort(function(a, b) {
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  return photos;
}

function makeThumbnailUrl_(fileId) {
  return "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1200";
}

function jsonOutput(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
