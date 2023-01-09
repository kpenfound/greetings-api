package tasks

import "context"

func Ci(ctx context.Context) error {
	// lint
	err := Lint(ctx)
	if err != nil {
		return err
	}
	// test
	err = Test(ctx)
	if err != nil {
		return err
	}
	// build
	err = Build(ctx)
	if err != nil {
		return err
	}

	return nil
}
