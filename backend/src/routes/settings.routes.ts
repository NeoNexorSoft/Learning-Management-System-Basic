router.get("/social-language", authenticate, async (req, res) => {
  res.json({
    google_enabled: false,
    google_client_id: "",
    google_client_secret: "",
    facebook_enabled: false,
    facebook_client_id: "",
    facebook_client_secret: "",
    language: "en",
  });
});

router.put("/social-language", authenticate, async (req, res) => {
  res.json({
    message: "Saved successfully",
    data: req.body,
  });
});
