package tasks

import (
//	"os"

	"dagger.io/dagger"
)

func getSource(client *dagger.Client) *dagger.Directory {
	//if os.Getenv("CIRCLE_SHA1") != "" {
	//	repo := "https://github.com/kpenfound/greetings-api.git"
	//	commit := os.Getenv("CIRCLE_SHA1")
	//	return client.Git(repo).Commit(commit).Tree().
	//		WithoutDirectory(".circleci").
	//		WithoutDirectory(".github").
	//		WithoutDirectory("ci")
	//}
	return client.Host().Directory(".", dagger.HostDirectoryOpts{
		Exclude: []string{
			".circleci/*",
			".github/*",
			"ci/*",
			"output/*",
		},
	})
}

// TODO: deps and vulns
// func sbom() error {
// 	imageTagParts := strings.Split(publishAddress, "/")
// 	imageTag := imageTagParts[len(imageTagParts)-1]
// 	fileout := fmt.Sprintf("%s_sbom.rdf", imageTag)
// 	config := &builder.Config2_2{
// 		NamespacePrefix: "https://github.com/kpenfound/greetings-api",
// 		CreatorType:     "Person",
// 		Creator:         "kpenfound",
// 		PathsIgnored: []string{
// 			"/.git/",
// 			"/.vscode/",
// 		},
// 	}

// 	workdir, err := os.Getwd()
// 	if err != nil {
// 		return err
// 	}
// 	doc, err := builder.Build2_2(publishAddress, workdir, config)
// 	if err != nil {
// 		return err
// 	}

// 	w, err := os.Create(fileout)
// 	if err != nil {
// 		return err
// 	}
// 	defer w.Close()

// 	return tvsaver.Save2_2(doc, w)

// }

// TODO: expand key options
// func cosignSign(image string, key string) error {
// 	args := []string{image}
// 	o := &options.SignOptions{
// 		Upload:           true,
// 		Key:              key,
// 		Force:            false,
// 		Recursive:        false,
// 		SkipConfirmation: false,
// 		NoTlogUpload:     false,
// 	}
// 	ro := &options.RootOptions{
// 		Timeout: 3 * time.Minute,
// 		Verbose: false,
// 	}
// 	ko := options.KeyOpts{
// 		KeyRef: o.Key,
// 	}
// 	annotationsMap, err := o.AnnotationsMap()
// 	if err != nil {
// 		return err
// 	}

// 	fmt.Printf("Signing %s\n", image)
// 	return sign.SignCmd(ro, ko, o.Registry, annotationsMap.Annotations, args, o.Cert, o.CertChain, o.Upload,
// 		o.OutputSignature, o.OutputCertificate, o.PayloadPath, o.Force, o.Recursive, o.Attachment, o.NoTlogUpload)
// }
